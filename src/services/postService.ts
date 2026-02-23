import { apiService } from './api';
import { authService } from './authService';

export interface PostComment {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    company?: string;
    position?: string;
  };
  title: string;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: PostComment[];
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

class PostService {
  async getAll(): Promise<Post[]> {
    const token = authService.getToken();
    const res = await apiService.get<{ success: boolean; data: Post[] }>('/posts', token || undefined);
    return res.data;
  }

  async getById(id: string): Promise<Post> {
    const token = authService.getToken();
    const res = await apiService.get<{ success: boolean; data: Post }>(`/posts/${id}`, token || undefined);
    return res.data;
  }

  async create(data: { title: string; content: string; imageUrl?: string }): Promise<Post> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: Post }>('/posts', data, token);
    return res.data;
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.put<{ success: boolean; data: Post }>(`/posts/${id}`, data, token);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    await apiService.delete(`/posts/${id}`, token);
  }

  async likePost(id: string): Promise<Post> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: Post }>(`/posts/${id}/like`, {}, token);
    return res.data;
  }

  async addComment(id: string, content: string): Promise<Post> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: Post }>(`/posts/${id}/comments`, { content }, token);
    return res.data;
  }
}

export const postService = new PostService();
