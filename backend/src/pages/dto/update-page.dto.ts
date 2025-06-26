import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  description?: string;
} 