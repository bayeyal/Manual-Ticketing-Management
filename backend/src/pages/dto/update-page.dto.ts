import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdatePageDto {
  @IsUrl()
  @IsOptional()
  url?: string;
} 