import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { TaskStatus, TaskSeverity, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  wcagCriteria: string;

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

  @IsString()
  @IsOptional()
  screenshotTitle?: string;

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
  @IsNotEmpty()
  projectId: number;

  @IsNumber()
  @IsNotEmpty()
  pageId: number;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
} 