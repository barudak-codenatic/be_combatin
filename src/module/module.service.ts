import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { moduleDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ModuleService {
    constructor(
        private prisma : PrismaService,
    ) {}

    async getAllModule() {
        const modules = await this.prisma.module.findMany()
        return modules
    }

    async createModule(dto : moduleDto) {
        try {
            await this.prisma.module.create({
                data : {
                    ...dto
                }
            })
            return { message : 'Berhasil menambahkan modul' }
        } catch (error) {
            throw error
        }
    }

    async updateModule(moduleId : string, dto : moduleDto) {
        try {
            await this.prisma.module.update({
                where : {
                    id : moduleId
                },
                data : {
                    ...dto
                }
            })
            if (!module) throw new NotFoundException('module tidak ada')
            return { message : 'Berhasil memperbarui modul' }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2023') {
                    throw new NotFoundException('Modul tidak ditemukan')
                }
            }
            throw error
        }
    }

    async deleteModule(moduleId : string) {
        try {
            await this.prisma.module.delete({
                where : {
                    id : moduleId
                }
            })
            if (!module) throw new NotFoundException('module tidak ada')
            return { message : 'Berhasil menghapus modul' }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2023') {
                    throw new NotFoundException('Modul tidak ditemukan')
                }
            }
            throw error
        }
    }
}
