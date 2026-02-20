import { apiService } from './api';
import { authService } from './authService';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  category: 'achievement' | 'event' | 'announcement' | 'spotlight' | 'general';
  coverImage?: string;
  publishedAt: string;
  updatedAt?: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  views: number;
  likes: number;
}

export interface Comment {
  id: string;
  articleId: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
}

class NewsService {
  async getNews(filters?: {
    category?: string;
    status?: string;
    author?: string;
  }): Promise<NewsArticle[]> {
    const token = authService.getToken();
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = `/news${query ? `?${query}` : ''}`;

    return apiService.get<NewsArticle[]>(endpoint, token || undefined);
  }

  async getArticleById(id: string): Promise<NewsArticle> {
    const token = authService.getToken();
    return apiService.get<NewsArticle>(`/news/${id}`, token || undefined);
  }

  async createArticle(
    articleData: Omit<NewsArticle, 'id' | 'publishedAt' | 'views' | 'likes'>
  ): Promise<NewsArticle> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<NewsArticle>('/news', articleData, token);
  }

  async updateArticle(
    id: string,
    articleData: Partial<NewsArticle>
  ): Promise<NewsArticle> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.put<NewsArticle>(`/news/${id}`, articleData, token);
  }

  async deleteArticle(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.delete(`/news/${id}`, token);
  }

  async likeArticle(id: string): Promise<{ likes: number }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<{ likes: number }>(`/news/${id}/like`, {}, token);
  }

  async unlikeArticle(id: string): Promise<{ likes: number }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.delete<{ likes: number }>(`/news/${id}/like`, token);
  }

  async getComments(articleId: string): Promise<Comment[]> {
    const token = authService.getToken();
    return apiService.get<Comment[]>(
      `/news/${articleId}/comments`,
      token || undefined
    );
  }

  async addComment(
    articleId: string,
    content: string
  ): Promise<Comment> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<Comment>(
      `/news/${articleId}/comments`,
      { content },
      token
    );
  }

  async updateComment(
    commentId: string,
    content: string
  ): Promise<Comment> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.put<Comment>(
      `/news/comments/${commentId}`,
      { content },
      token
    );
  }

  async deleteComment(commentId: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.delete(`/news/comments/${commentId}`, token);
  }
}

export const newsService = new NewsService();
