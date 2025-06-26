import { IsString, IsUrl, IsNumber, IsOptional } from 'class-validator';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  projectId: number;
} 