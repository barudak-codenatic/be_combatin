import { Body, Controller, Get, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { UserDto } from './dto';
import { FileValidationInterceptor } from './file-validation';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private user: UserService) {}

    @Get('me')
    getMe(@GetUser() user : User) {
        const {hash:_, ...userWithoutHash} = user
        return userWithoutHash
    }

    @Put('update')
    @UseInterceptors(FileInterceptor('file'))
    updateProfile(
        @GetUser('id') userId:string,
        @GetUser('img_url') img_url:string,
        @Body() dto: UserDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.user.updateProfile(userId, img_url, dto, file)
    }
}
