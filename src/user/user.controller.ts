import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { UserDto } from './dto';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { imageFileFilter } from 'src/utils';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private user: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    const { hash: _, ...userWithoutHash } = user;
    return userWithoutHash;
  }

  @Put('update')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  updateProfile(
    @GetUser('id') userId: string,
    @GetUser('img_url') img_url: string,
    @Body() dto: UserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.user.updateProfile(userId, img_url, dto, file);
  }

  @Get('search')
  searchByName(@Query('name') name: string) {
    return this.user.searchByName(name);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.user.getById(id);
  }
}
