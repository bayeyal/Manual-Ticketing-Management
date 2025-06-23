import { Project } from './project';
import { Task } from './task';

export interface Page {
  id: number;
  url: string;
  project: Project;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageDto {
  url: string;
  projectId: number;
}

export interface UpdatePageDto {
  url?: string;
} 