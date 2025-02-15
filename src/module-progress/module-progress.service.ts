import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ModuleProgressService {
    constructor(
        private prisma : PrismaService,
    ) {}

    async createModuleProgress(moduleId) {

    }
}
