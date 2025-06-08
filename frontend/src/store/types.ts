import { Project } from '@/types/project';
import { Task } from '@/types/task';
import { User } from '@/types/user';

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

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  projects: ProjectsState;
  tasks: TasksState;
  auth: AuthState;
} 