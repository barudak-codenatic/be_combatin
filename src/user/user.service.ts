import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UserDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        private prisma:PrismaService,
        private cloudinary: CloudinaryService
    ) {}

    async updateProfile(
        userId:string,
        img_url:string,
        updateData: UserDto,
        file?: Express.Multer.File
    ) {
        try {
            let imageUrl: null | string = null;
    
            if (img_url) {
                const publicId = this.cloudinary.extractPublicIdFromUrl(img_url);
                if (publicId) {
                    await this.cloudinary.destroyFile(publicId);
                }
            }
    
            if (file) {
                const uploadResult = await this.cloudinary.uploadFile(file);
                imageUrl = uploadResult.secure_url;
            }
    
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    ...updateData,
                    img_url: imageUrl || undefined
                }
            });
    
            if (!updatedUser) throw new BadRequestException('user tidak ada');
    
            return { message: 'Profile berhasil diupdate' };
        } catch (error) {
            throw error;
        }
    }
    
}
