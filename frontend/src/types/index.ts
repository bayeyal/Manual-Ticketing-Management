// Export base types
export * from './base';

// Export all types and enums from individual files
export * from './user';
export * from './project';
export * from './task';

// Re-export commonly used types
export type { LoginDto, RegisterDto } from './user';
export type { CreateProjectDto } from './project';
export type { CreateTaskDto } from './task';

// Re-export enums
export { UserRole } from './user';
export { AuditType, ProjectStatus } from './project';
export { TaskStatus, TaskSeverity } from './task';

import { Task as TaskType } from './task';
import { Project as ProjectType } from './project';
import { User as UserType } from './user';

export type Task = TaskType;
export type Project = ProjectType;
export type User = UserType;

export * from './task';
export * from './project';
export * from './user';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
} 