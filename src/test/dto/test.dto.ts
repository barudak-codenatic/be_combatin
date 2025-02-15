import { isObject, IsObject, IsOptional, IsString } from "class-validator";

interface Config {
    mode : string,
    config : string[]
}

export class TestDto {
    @IsString()
    title : string;

    @IsString()
    description : string;

    @IsObject()
    config : any;
}

export class UpdateTestDto {
    @IsOptional()
    @IsString()
    title : string;
    
    @IsOptional()
    @IsString()
    description : string;

    @IsOptional()
    config : any;
}