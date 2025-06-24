import { BaseEntity } from './base';
import { User } from './user';
import { Project } from './project';

export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export enum TaskSeverity {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface TaskMessage {
  id: number;
  content: string;
  createdAt: string;
  user: User;
  mentionedUser?: User;
}

export interface Task extends BaseEntity {
  id: number;
  title: string;
  description: string;
  wcagCriteria: string;
  wcagVersion: string;
  conformanceLevel: string;
  defectSummary?: string;
  recommendation?: string;
  userImpact?: string;
  comments?: string;
  disabilityType?: string;
  screenshot?: string;
  severity: TaskSeverity;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: User;
  auditor?: User;
  project: Project;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  messages?: TaskMessage[];
}

export interface CreateTaskDto {
  title: string;
  description: string;
  wcagCriteria: string;
  wcagVersion: string;
  conformanceLevel: string;
  defectSummary?: string;
  recommendation?: string;
  userImpact?: string;
  comments?: string;
  disabilityType?: string;
  screenshot?: string;
  severity?: TaskSeverity;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: number;
  auditorId?: number;
  projectId: number;
  dueDate: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  wcagCriteria?: string;
  wcagVersion?: string;
  conformanceLevel?: string;
  defectSummary?: string;
  recommendation?: string;
  userImpact?: string;
  comments?: string;
  disabilityType?: string;
  screenshot?: string;
  severity?: TaskSeverity;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: number;
  auditorId?: number;
  dueDate?: string;
} 