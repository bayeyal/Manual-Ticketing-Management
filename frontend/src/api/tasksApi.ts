import { Task } from '../types/task';
import { api } from '../services/api';

export const tasksApi = {
  getByProjectId: (projectId: number) =>
    api.get<Task[]>(`/tasks?projectId=${projectId}`).then(res => res.data),

  getById: (id: number) =>
    api.get<Task>(`/tasks/${id}`).then(res => res.data),

  create: (task: Partial<Task>) =>
    api.post<Task>('/tasks', task).then(res => res.data),

  update: (id: number, task: Partial<Task>) =>
    api.patch<Task>(`/tasks/${id}`, task).then(res => res.data),

  delete: (id: number) =>
    api.delete(`/tasks/${id}`).then(res => res.data),

  assignUser: (taskId: number, userId: number) =>
    api.post<Task>(`/tasks/${taskId}/users/${userId}`).then(res => res.data),

  removeUser: (taskId: number) =>
    api.delete<Task>(`/tasks/${taskId}/users`).then(res => res.data),

  addMessage: (taskId: number, content: string, mentionedUserId?: number) =>
    api.post(`/tasks/${taskId}/messages`, { content, mentionedUserId }).then(res => res.data),

  getMessages: (taskId: number) =>
    api.get(`/tasks/${taskId}/messages`).then(res => res.data),
}; 