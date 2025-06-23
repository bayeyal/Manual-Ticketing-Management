import { IsString, IsUrl, IsNumber } from 'class-validator';

export class CreatePageDto {
  @IsUrl()
  url: string;

  @IsNumber()
  projectId: number;
} 