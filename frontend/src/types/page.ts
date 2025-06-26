import { Project } from './project';
import { Task } from './task';

export interface Page {
  id: number;
  title: string;
  url: string;
  description?: string;
  project: Project;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageDto {
  title: string;
  url: string;
  description?: string;
  projectId: number;
}

export interface UpdatePageDto {
  title?: string;
  url?: string;
  description?: string;
} 