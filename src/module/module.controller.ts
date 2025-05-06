import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { ModuleService } from './module.service';
import { moduleDto, updateModuleDto } from './dto';
import { GetUser, Roles } from 'src/auth/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils';

@Controller('modules')
@UseGuards(JwtGuard, RolesGuard)
export class ModuleController {
  constructor(private module: ModuleService) {}

  @Get()
  getAllModule(@GetUser('id') userId: string) {
    return this.module.getAllModule(userId);
  }

  @Get('search')
  searchModules(@Query('name') name: string) {
    return this.module.searchModules(name);
  }

  @Get(':id')
  getModuleById(@Param('id') moduleId: string, @GetUser('id') userId: string) {
    return this.module.getModuleById(moduleId, userId);
  }

  @Roles('ADMIN')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  createModule(
    @Body() dto: moduleDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.module.createModule(dto, file);
  }

  @Roles('ADMIN')
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  updateModule(
    @Body() dto: updateModuleDto,
    @Param('id') moduleId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.module.updateModule(moduleId, dto, file);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deleteModule(@Param('id') moduleId: string) {
    return this.module.deleteModule(moduleId);
  }
}
