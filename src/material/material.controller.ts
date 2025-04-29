import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MaterialService } from './material.service';
import { materialDto, updateMaterialDto } from './dto';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';

@Controller('materials')
@UseGuards(JwtGuard, RolesGuard)
export class MaterialController {
  constructor(private material: MaterialService) {}

  @Get(':id')
  getMaterialById(@Param('id') materialId: string) {
    return this.material.getmaterialById(materialId);
  }

  @Roles('ADMIN')
  @Post(':moduleId')
  createMaterial(
    @Body() dto: materialDto,
    @Param('moduleId') moduleId: string,
  ) {
    return this.material.createMaterial(moduleId, dto);
  }

  @Roles('ADMIN')
  @Put(':id')
  updateMaterial(
    @Body() dto: updateMaterialDto,
    @Param('id') materialId: string,
  ) {
    return this.material.updateMaterial(materialId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deleteMaterial(@Param('id') materialId: string) {
    return this.material.deleteMaterial(materialId);
  }
}
