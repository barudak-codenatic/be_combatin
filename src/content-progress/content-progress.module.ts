import { Module } from '@nestjs/common';
import { ContentProgressService } from './content-progress.service';
import { ContentProgressController } from './content-progress.controller';

@Module({
  providers: [ContentProgressService],
  controllers: [ContentProgressController]
})
export class ContentProgressModule {}
