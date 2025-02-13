import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ModuleService } from './module.service';
import { moduleDto } from './dto';

@UseGuards(JwtGuard)
@Controller('modules')
export class ModuleController {
    constructor(private module : ModuleService) {}

    @Get()
    getAllModule() {
        return this.module.getAllModule()
    }

    @Post()
    createModule(@Body() dto:moduleDto) {
        return this.module.createModule(dto)
    }

    @Put(':id')
    updateModule(@Body() dto:moduleDto, @Param('id') moduleId : string) {
        return this.module.updateModule(moduleId, dto)
    }

    @Delete(':id')
    deleteModule(@Param('id') moduleId : string) {
        return this.module.deleteModule(moduleId)
    }
}
