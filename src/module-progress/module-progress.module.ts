import { Module } from '@nestjs/common';
import { ModuleProgressService } from './module-progress.service';
import { ModuleProgressController } from './module-progress.controller';

@Module({
  providers: [ModuleProgressService],
  controllers: [ModuleProgressController],
})
export class ModuleProgressModule {}
