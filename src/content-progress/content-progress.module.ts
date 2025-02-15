import { Module } from '@nestjs/common';
import { ContentProgressService } from './content-progress.service';
import { ContentProgressController } from './content-progress.controller';
import { ModuleModule } from 'src/module/module.module';

@Module({
  providers: [ContentProgressService],
  controllers: [ContentProgressController],
  imports : [ModuleModule]
})
export class ContentProgressModule {}
