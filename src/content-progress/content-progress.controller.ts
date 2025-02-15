import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ContentProgressService } from './content-progress.service';
import { contentProgressDto } from './dto';
import { GetUser } from 'src/auth/decorator';

@Controller('content-progress')
@UseGuards(JwtGuard)
export class ContentProgressController {
    constructor(private contentProgress : ContentProgressService) {}

    @Post(':moduleId')
    createContentProgress(
        @Body() dto : contentProgressDto,
        @GetUser('id') userId : string,
        @Param('moduleId') moduleId : string
    ) {
        return this.contentProgress.createContentProgress(userId, moduleId, dto)
    }
}
