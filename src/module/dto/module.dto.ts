import { IsString } from "class-validator";

export class moduleDto {
    @IsString()
    name : string

    @IsString()
    description : string
}