import { Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SendOtpDto, VerifyDto, SigninDto, ResetPasswordDto, SendOtpForgotDto, ForgotPasswordDto } from './dto';
import { JwtGuard } from './guard';
import { GetUser } from './decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService) {}

    @Post('signup')
    signup(@Body() dto:SignupDto) {
        return this.authService.signup(dto)
    }

    @Post('signin')
    signin(@Body() dto:SigninDto) {
        return this.authService.signin(dto)
    }

    @Post('sendotp')
    sendotp(@Body() dto:SendOtpDto) {
        return this.authService.sendotp(dto)
    }

    @Post('verify')
    verify(@Body() dto:VerifyDto) {
        return this.authService.verify(dto)
    }

    @UseGuards(JwtGuard)
    @Post('refresh')
    refresh(@GetUser('email') email:string, @GetUser('id') userId:string) {
        return this.authService.refreshToken(email, userId)
    }

    @UseGuards(JwtGuard)
    @Post('resetpassword')
    reset(@Body() dto:ResetPasswordDto, @GetUser('hash') hash:string, @GetUser('id') userId:string) {
        return this.authService.resetPassword(userId, hash, dto)
    }

    @Post('forgotPasswordOtp')
    forgotPasswordOtp(@Body() dto:SendOtpForgotDto) {
        return this.authService.forgotPasswordOtp(dto.email)
    }

    @Post('verifyOtpForgot')
    verifyOtpForgot(@Body() dto:ForgotPasswordDto) {
        return this.authService.verifyOtpForgot(dto)
    }
}
