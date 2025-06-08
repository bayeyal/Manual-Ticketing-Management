import { Task } from './task';
import { Project } from './project';

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export interface RootState {
  tasks: TasksState;
  projects: ProjectsState;
} 