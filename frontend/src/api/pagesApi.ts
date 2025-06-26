import { api } from '../services/api';
import { Page, CreatePageDto, UpdatePageDto } from '../types/page';

export const pagesApi = {
  getAll: (projectId?: number) => {
    const params = projectId ? { projectId } : {};
    return api.get<Page[]>('/pages', { params }).then(res => res.data);
  },

  getById: (id: number) => {
    return api.get<Page>(`/pages/${id}`).then(res => res.data);
  },

  create: (data: CreatePageDto) => {
    return api.post<Page>('/pages', data).then(res => res.data);
  },

  createFromSitemap: (projectId: number, sitemapXml: string) => {
    return api.post<Page[]>('/pages/sitemap', { projectId, sitemapXml }).then(res => res.data);
  },

  update: (id: number, data: UpdatePageDto) => {
    return api.patch<Page>(`/pages/${id}`, data).then(res => res.data);
  },

  delete: (id: number) => {
    return api.delete(`/pages/${id}`).then(res => res.data);
  },
}; 