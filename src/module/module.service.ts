import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { moduleDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ModuleService {
    constructor(
        private prisma : PrismaService,
        private cloudinary : CloudinaryService
    ) {}

    async getAllModule() {
        const modules = await this.prisma.module.findMany()
        return modules
    }

    async getModuleById(moduleId:string, userId:string) {
        const module = await this.prisma.module.findUnique({
            where : {
                id : moduleId
            },
            include : {
                materials : {
                    select : {
                        id : true,
                        title : true,
                        createdAt : true,
                        updatedAt : true,
                        completed : {
                            where : {
                                userId,
                            }
                        }
                    }
                },
                progress : {
                    where : {
                        userId,
                    }
                },
                test : {
                    select : {
                        id : true,
                        title : true,
                        createdAt : true,
                        updatedAt : true,
                        completed : {
                            where : {
                                userId
                            }
                        }
                    }
                }
            }
        })
        if (!module) throw new NotFoundException('Module tidak ditemukan')
        return module
    }

    async createModule(dto : moduleDto, file? : Express.Multer.File) {
        try {
            let img_url: null | string = null;
    
            if (file) {
                const uploadResult = await this.cloudinary.uploadFile(file);
                img_url = uploadResult.secure_url;
            }

            await this.prisma.module.create({
                data : {
                    img_url,
                    ...dto
                }
            })
            return { message : 'Berhasil menambahkan modul' }
        } catch (error) {
            throw error
        }
    }

    async updateModule(
        moduleId : string, 
        dto : moduleDto, 
        file? : Express.Multer.File,
    ) {
        try {
            let new_img_url: null | string = null;

            const module = await this.prisma.module.findUnique({
                where : {
                    id : moduleId
                }
            })

            if (module?.img_url) {
                const publicId = this.cloudinary.extractPublicIdFromUrl(module?.img_url);
                if (publicId) {
                    await this.cloudinary.destroyFile(publicId);
                }
            }
    
            if (file) {
                const uploadResult = await this.cloudinary.uploadFile(file);
                new_img_url = uploadResult.secure_url;
            }

            await this.prisma.module.update({
                where : {
                    id : moduleId
                },
                data : {
                    img_url : new_img_url,
                    ...dto
                }
            })
            return { message : 'Berhasil memperbarui modul' }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2023'||error.code === 'P2025') {
                    throw new NotFoundException('Modul tidak ditemukan')
                }
            }
            throw error
        }
    }

    async deleteModule(moduleId : string) {
        try {
            const module = await this.prisma.module.findUnique({
                where : {
                    id : moduleId
                }
            })

            if (module?.img_url) {
                const publicId = this.cloudinary.extractPublicIdFromUrl(module?.img_url);
                if (publicId) {
                    await this.cloudinary.destroyFile(publicId);
                }
            }

            await this.prisma.module.delete({
                where : {
                    id : moduleId
                }
            })
            return { message : 'Berhasil menghapus modul' }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2023'||error.code === 'P2025') {
                    throw new NotFoundException('Modul tidak ditemukan')
                }
            }
            throw error
        }
    }
}
