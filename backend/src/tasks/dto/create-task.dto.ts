import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { TaskSeverity, TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  wcagCriteria: string;

  @IsString()
  wcagVersion: string;

  @IsString()
  conformanceLevel: string;

  @IsString()
  @IsOptional()
  defectSummary?: string;

  @IsString()
  @IsOptional()
  recommendation?: string;

  @IsString()
  @IsOptional()
  userImpact?: string;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  disabilityType?: string;

  @IsString()
  @IsOptional()
  screenshot?: string;

  @IsEnum(TaskSeverity)
  @IsOptional()
  severity?: TaskSeverity;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsNumber()
  @IsOptional()
  assignedToId?: number;

  @IsNumber()
  @IsOptional()
  auditorId?: number;

  @IsNumber()
  @IsOptional()
  projectId?: number;

  @IsNumber()
  pageId: number;

  @IsDateString()
  dueDate: string;
} 