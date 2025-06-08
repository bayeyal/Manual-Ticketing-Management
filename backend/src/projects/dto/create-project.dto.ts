import { IsString, IsOptional, IsUrl, IsDateString, IsArray, IsNumber, IsEnum } from 'class-validator';
import { AuditType, AuditLevel } from '../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  url: string;

  @IsUrl()
  @IsOptional()
  sitemapUrl?: string;

  @IsEnum(AuditType)
  auditType: AuditType;

  @IsEnum(AuditLevel)
  auditLevel: AuditLevel;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  projectAdminId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  auditorIds?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  assignedUserIds?: number[];
} 