import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsUrl } from 'class-validator';
import { TaskStatus, TaskSeverity, TaskPriority } from '../entities/task.entity';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  projectId: number;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsEnum(TaskSeverity)
  severity: TaskSeverity;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsString()
  wcagCriteria: string;

  @IsString()
  wcagVersion: string;

  @IsString()
  @IsEnum(['A', 'AA', 'AAA'])
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

  @IsUrl()
  pageUrl: string;

  @IsString()
  @IsOptional()
  screenshot?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value === undefined ? null : value)
  assignedToId?: number;

  @IsNumber()
  @IsOptional()
  auditorId?: number;

  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toISOString();
  })
  dueDate: Date;
} 