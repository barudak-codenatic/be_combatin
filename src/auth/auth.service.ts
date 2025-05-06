import {
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SignupDto,
  SendOtpDto,
  VerifyDto,
  SigninDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  RefreshDto,
} from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // hash password
    const hash = await argon.hash(dto.password);
    // save db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          hash,
        },
      });

      const { hash: _, ...userWithoutHash } = user;

      return userWithoutHash;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async sendotp(dto: SendOtpDto) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: dto.userId,
        },
      });

      if (user?.verified_at)
        return new UnauthorizedException('Email sudah verifikasi');

      // save otp
      await this.cacheManager.set(`otp_${user?.email}`, otp, 300000);
      const mail = this.mailService.sendMail({
        from: 'wastehub66@gmail.com',
        to: user?.email,
        subject: 'Kode OTP',
        text: `kode otp ${otp}. kadaluwasa setelah 5 menit`,
      });

      return { message: 'OTP telah dikirm' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          throw new NotFoundException('User tidak ada');
        }
      }
      throw error;
    }
  }

  async verify(dto: VerifyDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: dto.userId,
        },
      });

      if (user?.verified_at)
        return new UnauthorizedException('Email sudah verifikasi');

      const cachedOtp = await this.cacheManager.get(`otp_${user?.email}`);

      if (!cachedOtp) {
        throw new GoneException('OTP expired or invalid.');
      }

      if (cachedOtp != dto.otp) {
        throw new UnauthorizedException('Invalid OTP');
      }

      await this.prisma.user.update({
        where: {
          id: dto.userId,
        },
        data: {
          verified_at: new Date().toISOString(),
        },
      });

      await this.cacheManager.del(`otp_${user?.email}`);

      return { message: 'Akun terverifikasi' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          throw new NotFoundException('User tidak ada');
        }
      }
      throw error;
    }
  }

  async signin(dto: SigninDto) {
    let pwMatches;
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user) pwMatches = await argon.verify(user.hash, dto.password);

    if (!user || !pwMatches)
      throw new ForbiddenException('Email atau password salah');

    return this.signToken(user.id, user.email, user.role);
  }

  async signToken(userId: string, email: string, userRole: string) {
    const payload = { sub: userId, email: email };

    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, userId, email, userRole };
  }

  async refreshToken(refreshTokenDto: RefreshDto) {
    const { refreshToken } = refreshTokenDto;
    try {
      const payload = await this.jwt.verifyAsync(refreshToken);
      const newAccessToken = await this.jwt.signAsync(
        { email: payload.email, sub: payload.sub },
        { expiresIn: '15m' },
      );
      return { accessToken: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async resetPassword(
    userId: string,
    userHash: string,
    passwordDto: ResetPasswordDto,
  ) {
    const pwMatches = await argon.verify(userHash, passwordDto.oldPassword);

    console.log(userId);

    if (!pwMatches) throw new ForbiddenException('Password salah');

    const hash = await argon.hash(passwordDto.lastPassword);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hash,
      },
    });

    return { massage: 'Password berhasil direset' };
  }

  async forgotPasswordOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cacheManager.set(`forgot_otp_${email}`, otp, 300000);

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('User tidak ada');

    const mail = this.mailService.sendMail({
      from: 'wastehub66@gmail.com',
      to: email,
      subject: 'Kode OTP',
      text: `kode otp untuk lupa password ${otp}. kadaluwasa setelah 5 menit`,
    });

    return { message: 'OTP telah dikirm' };
  }

  async verifyOtpForgot(dto: ForgotPasswordDto) {
    const cachedOtp = await this.cacheManager.get(`forgot_otp_${dto.email}`);

    if (!cachedOtp) {
      throw new GoneException('OTP expired or invalid.');
    }

    if (cachedOtp != dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const hash = await argon.hash(dto.password);

    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        hash,
      },
    });

    await this.cacheManager.del(`forgot_otp_${dto.email}`);

    return { message: 'Password telah diubah' };
  }
}
