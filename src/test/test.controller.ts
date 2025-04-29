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
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { TestService } from './test.service';
import { Roles } from 'src/auth/decorator';
import { TestDto, UpdateTestDto } from './dto';

@Controller('test')
@UseGuards(JwtGuard, RolesGuard)
export class TestController {
  constructor(private test: TestService) {}

  @Get(':id')
  getTestById(@Param('id') testId: string) {
    return this.test.getTestById(testId);
  }

  @Roles('ADMIN')
  @Post(':moduleId')
  createTest(@Body() dto: TestDto, @Param('moduleId') moduleId: string) {
    return this.test.createTest(moduleId, dto);
  }

  @Roles('ADMIN')
  @Put(':id')
  updateTest(@Body() dto: UpdateTestDto, @Param('id') testId: string) {
    return this.test.updateTest(testId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deleteTest(@Param('id') testId: string) {
    return this.test.deleteTest(testId);
  }
}
