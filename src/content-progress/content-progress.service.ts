import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { contentProgressDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ModuleService } from 'src/module/module.service';

@Injectable()
export class ContentProgressService {
  constructor(
    private prisma: PrismaService,
    private module: ModuleService,
  ) {}

  async createContentProgress(
    userId: string,
    moduleId: string,
    dto: contentProgressDto,
  ) {
    try {
      await this.prisma.contentProgress.create({
        data: {
          userId,
          ...dto,
        },
      });

      const module = await this.module.getModuleById(moduleId, userId);

      const totalMaterial = module.materials.length;
      const totalTest = module.test.length;
      const totalItems = totalMaterial + totalTest;

      const completedMaterial = module.materials.filter(
        (m) => m.completed.length > 0,
      ).length;
      const completedTest = module.test.filter(
        (m) => m.completed.length > 0,
      ).length;
      const completedItems = completedMaterial + completedTest;

      const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      await this.prisma.moduleProgress.create({
        data: {
          moduleId,
          userId,
          progress,
        },
      });

      return { message: 'Berhasil menambahkan progress' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          throw new NotFoundException('Progress tidak ditemukan');
        }
      }
      throw error;
    }
  }
}
