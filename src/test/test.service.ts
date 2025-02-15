import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { TestDto, UpdateTestDto } from './dto';

@Injectable()
export class TestService {
    constructor(
        private prisma : PrismaService,
    ) {}

    async getTestById(testId:string) {
        const test = await this.prisma.test.findUnique({
            where : {
                id : testId
            }
        })
        if (!test) throw new NotFoundException('test tidak ditemukan')
        return test
    }

    async createTest(moduleId : string, dto : TestDto) {
        try {
            await this.prisma.test.create({
                data : {
                    moduleId,
                    ...dto

                }
            })
            return { message : 'Berhasil menambahkan test' }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2023') {
                    throw new NotFoundException('Test tidak ditemukan')
                }
            }
            throw error
        }
    }

    async updateTest(testId : string, dto : UpdateTestDto) {
        try {
            await this.prisma.test.update({
                where : {
                    id : testId
                },
                data : {
                    ...dto
                }
            })
            return { message : 'Berhasil memperbarui test' }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2023'||error.code === 'P2025') {
                    throw new NotFoundException('Test tidak ditemukan')
                }
            }
            throw error
        }
    }

    async deleteTest(testId : string) {
        try {
            await this.prisma.test.delete({
                where : {
                    id : testId
                }
            })
            return { message : 'Berhasil menghapus test' }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2023'||error.code === 'P2025') {
                    throw new NotFoundException('Test tidak ditemukan')
                }
            }
            throw error
        }
    }
}
