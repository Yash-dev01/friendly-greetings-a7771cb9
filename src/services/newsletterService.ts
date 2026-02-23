import { apiService } from './api';
import { authService } from './authService';

export interface Newsletter {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  publishedDate: string;
  isPublished: boolean;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

class NewsletterService {
  async getAll(published?: boolean): Promise<Newsletter[]> {
    const token = authService.getToken();
    const query = published !== undefined ? `?published=${published}` : '';
    const res = await apiService.get<{ success: boolean; data: Newsletter[] }>(`/newsletters${query}`, token || undefined);
    return res.data;
  }

  async getById(id: string): Promise<Newsletter> {
    const token = authService.getToken();
    const res = await apiService.get<{ success: boolean; data: Newsletter }>(`/newsletters/${id}`, token || undefined);
    return res.data;
  }

  async create(data: { title: string; content: string; imageUrl?: string }): Promise<Newsletter> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: Newsletter }>('/newsletters', data, token);
    return res.data;
  }

  async update(id: string, data: Partial<Newsletter>): Promise<Newsletter> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.put<{ success: boolean; data: Newsletter }>(`/newsletters/${id}`, data, token);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    await apiService.delete(`/newsletters/${id}`, token);
  }

  async publish(id: string): Promise<Newsletter> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.put<{ success: boolean; data: Newsletter }>(`/newsletters/${id}/publish`, {}, token);
    return res.data;
  }

  async unpublish(id: string): Promise<Newsletter> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.put<{ success: boolean; data: Newsletter }>(`/newsletters/${id}/unpublish`, {}, token);
    return res.data;
  }
}

export const newsletterService = new NewsletterService();
