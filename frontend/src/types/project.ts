import { BaseEntity } from './base';
import { User } from './user';
import { Task } from './task';

export enum ProjectStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

export enum AuditType {
  WCAG_2_0 = 'WCAG_2_0',
  WCAG_2_1 = 'WCAG_2_1',
  WCAG_2_2 = 'WCAG_2_2'
}

export enum AuditLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  url: string;
  auditType: AuditType;
  auditLevel: AuditLevel;
  startDate: string;
  endDate: string;
  dueDate: string;
  userId: number;
  status: ProjectStatus;
  projectAdmin: User;
  assignedUsers: User[];
  assignedUserIds?: number[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  url: string;
  auditType: AuditType;
  auditLevel: AuditLevel;
  startDate: string;
  endDate: string;
  dueDate: string;
  projectAdminId: number;
  auditorIds: number[];
  assignedUserIds?: number[];
} 