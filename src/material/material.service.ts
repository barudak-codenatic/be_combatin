import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { materialDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  async getmaterialById(materialId: string) {
    const material = await this.prisma.material.findUnique({
      where: {
        id: materialId,
      },
      include: {
        module: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!material) throw new NotFoundException('Materi tidak ditemukan');
    return material;
  }

  async createMaterial(moduleId: string, dto: materialDto) {
    try {
      await this.prisma.material.create({
        data: {
          moduleId,
          ...dto,
        },
      });
      return { message: 'Berhasil menambahkan materi' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          throw new NotFoundException('Materi tidak ditemukan');
        }
      }
      throw error;
    }
  }

  async updateMaterial(materialId: string, dto: materialDto) {
    try {
      await this.prisma.material.update({
        where: {
          id: materialId,
        },
        data: {
          ...dto,
        },
      });
      return { message: 'Berhasil memperbarui materi' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2023' || error.code === 'P2025') {
          throw new NotFoundException('Materi tidak ditemukan');
        }
      }
      throw error;
    }
  }

  async deleteMaterial(materialId: string) {
    try {
      await this.prisma.material.delete({
        where: {
          id: materialId,
        },
      });
      return { message: 'Berhasil menghapus materi' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2023' || error.code === 'P2025') {
          throw new NotFoundException('Materi tidak ditemukan');
        }
      }
      throw error;
    }
  }
}
