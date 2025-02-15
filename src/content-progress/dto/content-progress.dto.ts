import { IsBoolean, IsOptional, IsString } from "class-validator";
import { OneOrNone } from "src/decorator";

export class contentProgressDto {
    @IsString()
    @IsOptional()
    materialId : string;

    @IsString()
    @IsOptional()
    testId : string;

    @IsBoolean()
    completed : boolean;

    @OneOrNone('materialId', 'testId', { message: 'Harus mengisi salah satu antara materialId atau testId' })
    placeholder!: string;
}