import { User } from '../types/user';
import { api } from '../services/api';

export const usersApi = {
  getAll: () =>
    api.get<User[]>('/users').then(res => res.data),

  getById: (id: number) =>
    api.get<User>(`/users/${id}`).then(res => res.data),

  create: (user: Partial<User>) =>
    api.post<User>('/users', user).then(res => res.data),

  update: (id: number, user: Partial<User>) =>
    api.patch<User>(`/users/${id}`, user).then(res => res.data),

  delete: (id: number) =>
    api.delete(`/users/${id}`).then(res => res.data),
}; 