import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
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

    async searchByName(name:string) {
        const user = await this.prisma.user.findMany({
            where : {
                name : {
                    contains : name,
                    mode : 'insensitive'
                },
            },
            select : {
                id : true,
                name : true,
                img_url : true
            }
        })

        if (!user) throw new NotFoundException('nama tidak ditemukan')
        return user
    }

    async getById(id:string) {
        const user = await this.prisma.user.findUnique({
            where : {
                id
            }
        })

        if (!user) throw new NotFoundException('user tidak ditemukan')
        const {hash:_, ...userWithoutHash} = user
        return userWithoutHash
    }
}
