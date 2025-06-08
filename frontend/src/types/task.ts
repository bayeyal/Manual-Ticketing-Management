import { BaseEntity } from './base';
import { User } from './user';
import { Project } from './project';

export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  ON_HOLD = 'ON_HOLD'
}

export enum TaskSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW'
}

export enum TaskPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
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
  status: TaskStatus;
  severity: TaskSeverity;
  priority: TaskPriority;
  wcagCriteria: string;
  wcagVersion: string;
  conformanceLevel: string;
  defectSummary: string;
  recommendation: string;
  userImpact: string;
  comments: string;
  disabilityType: string;
  pageUrl: string;
  screenshot?: string;
  dueDate: string;
  projectId: number;
  assignedTo?: User;
  auditor?: User;
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
  pageUrl: string;
  severity: TaskSeverity;
  status: TaskStatus;
  screenshot?: string;
  assignedToId?: number;
  priority: TaskPriority;
  dueDate: string;
  projectId: number;
} 