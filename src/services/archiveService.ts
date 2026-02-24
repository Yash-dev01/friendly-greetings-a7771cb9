import { apiService } from './api';
import { authService } from './authService';

export interface Archive {
  _id: string;
  title: string;
  description: string;
  year: number;
  category: string;
  createdAt: string;
}

class ArchiveService {
  async getArchives(filters?: { category?: string; year?: number }): Promise<Archive[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.year) params.append('year', filters.year.toString());
    const query = params.toString();
    const res = await apiService.get<{ success: boolean; data: Archive[] }>(
      `/archives${query ? `?${query}` : ''}`
    );
    return res.data;
  }

  async createArchive(data: Omit<Archive, '_id' | 'createdAt'>): Promise<Archive> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: Archive }>('/archives', data, token);
    return res.data;
  }

  async updateArchive(id: string, data: Partial<Archive>): Promise<Archive> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.put<{ success: boolean; data: Archive }>(`/archives/${id}`, data, token);
    return res.data;
  }

  async deleteArchive(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    await apiService.delete(`/archives/${id}`, token);
  }
}

export const archiveService = new ArchiveService();
