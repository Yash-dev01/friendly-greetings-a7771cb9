import { apiService } from './api';
import { authService } from './authService';

export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  uploadedBy?: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

class GalleryService {
  async getItems(): Promise<GalleryItem[]> {
    const token = authService.getToken();
    const res = await apiService.get<{ success: boolean; data: GalleryItem[] }>('/gallery', token || undefined);
    return res.data;
  }

  async getItemById(id: string): Promise<GalleryItem> {
    const token = authService.getToken();
    const res = await apiService.get<{ success: boolean; data: GalleryItem }>(`/gallery/${id}`, token || undefined);
    return res.data;
  }

  async createItem(data: { title: string; description?: string; mediaUrl: string; mediaType: 'photo' | 'video' }): Promise<GalleryItem> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: GalleryItem }>('/gallery', data, token);
    return res.data;
  }

  async updateItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.put<{ success: boolean; data: GalleryItem }>(`/gallery/${id}`, data, token);
    return res.data;
  }

  async deleteItem(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    await apiService.delete(`/gallery/${id}`, token);
  }
}

export const galleryService = new GalleryService();
