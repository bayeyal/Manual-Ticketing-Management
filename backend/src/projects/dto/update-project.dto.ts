import { IsString, IsOptional, IsUrl, IsDate, IsArray, IsNumber, IsEnum } from 'class-validator';
import { AuditType, AuditLevel, ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsUrl()
  @IsOptional()
  sitemapUrl?: string;

  @IsEnum(AuditType)
  @IsOptional()
  auditType?: AuditType;

  @IsEnum(AuditLevel)
  @IsOptional()
  auditLevel?: AuditLevel;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsNumber()
  @IsOptional()
  projectAdminId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  auditorIds?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  assignedUserIds?: number[];
} 