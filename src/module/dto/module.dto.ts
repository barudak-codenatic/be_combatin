import { IsOptional, IsString } from "class-validator";

export class moduleDto {
    @IsString()
    name : string

    @IsString()
    description : string
}

export class updateModuleDto {
    @IsString()
    @IsOptional()
    name : string
    
    @IsString()
    @IsOptional()
    description : string
}