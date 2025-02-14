import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MaterialService } from './material.service';
import { materialDto, updateMaterialDto } from './dto';
import { Roles } from 'src/auth/decorator';

@Controller('materials')
export class MaterialController {
    constructor(private material : MaterialService) {}

    @Get(':id')
    getMaterialById(@Param('id') materialId : string) {
        return this.material.getmaterialById(materialId)
    }
    
    @Roles('ADMIN')
    @Post(':moduleId')
    createMaterial(
        @Body() dto:materialDto,
        @Param('moduleId') moduleId : string

    ) {
        return this.material.createMaterial(moduleId, dto)
    }
    
    @Roles('ADMIN')
    @Put(':id')
    updateMaterial(
        @Body() dto:updateMaterialDto, 
        @Param('id') materialId : string,
    ) {
        return this.material.updateMaterial(materialId, dto)
    }
    
    @Roles('ADMIN')
    @Delete(':id')
    deleteMaterial(@Param('id') materialId : string) {
        return this.material.deleteMaterial(materialId)
    }
}
