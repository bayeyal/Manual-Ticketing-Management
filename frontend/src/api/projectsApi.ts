import { Project } from '../types/project';
import { api } from '../services/api';

export const projectsApi = {
  getAll: () =>
    api.get<Project[]>('/projects').then(res => res.data),

  getById: (id: number) =>
    api.get<Project>(`/projects/${id}`).then(res => res.data),

  create: (project: Partial<Project>) =>
    api.post<Project>('/projects', project).then(res => res.data),

  update: (id: number, project: Partial<Project>) =>
    api.patch<Project>(`/projects/${id}`, project).then(res => res.data),

  delete: (id: number) =>
    api.delete(`/projects/${id}`).then(res => res.data),
}; 