import { apiService } from './api';
import { authService } from './authService';

export interface ProfileData {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  industry?: string;
  experience?: number;
  skills?: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  department?: string;
  graduationYear?: number;
}

class ProfileService {
  async getProfile(): Promise<ProfileData> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.get<ProfileData>('/auth/me', token);
  }

  async updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.put<ProfileData>('/auth/profile', data, token);
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const formData = new FormData();
    formData.append('avatar', file);
    return apiService.post<{ url: string }>('/auth/upload-avatar', formData, token);
  }

  async uploadResume(file: File): Promise<{ url: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const formData = new FormData();
    formData.append('resume', file);
    return apiService.post<{ url: string }>('/auth/upload-resume', formData, token);
  }
}

export const profileService = new ProfileService();
