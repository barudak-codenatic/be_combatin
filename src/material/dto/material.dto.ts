import { IsOptional, IsString } from 'class-validator';

export class materialDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class updateMaterialDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content: string;
}
