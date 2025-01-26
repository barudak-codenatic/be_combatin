import { IsOptional, IsString } from "class-validator";

export class UserDto {
    @IsString()
    @IsOptional()
    name: string;
}