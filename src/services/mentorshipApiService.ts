import { apiService } from './api';
import { authService } from './authService';

export interface MentorshipRequestData {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    department?: string;
    graduationYear?: number;
  };
  alumniId: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    company?: string;
    position?: string;
    department?: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
}

class MentorshipApiService {
  async getRequests(status?: string): Promise<MentorshipRequestData[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const query = status ? `?status=${status}` : '';
    const res = await apiService.get<{ success: boolean; data: MentorshipRequestData[] }>(
      `/mentorship${query}`, token
    );
    return res.data;
  }

  async createRequest(alumniId: string, message: string): Promise<MentorshipRequestData> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: MentorshipRequestData }>(
      '/mentorship', { alumniId, message }, token
    );
    return res.data;
  }

  async updateStatus(id: string, status: 'accepted' | 'declined'): Promise<MentorshipRequestData> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.put<{ success: boolean; data: MentorshipRequestData }>(
      `/mentorship/${id}/status`, { status }, token
    );
    return res.data;
  }

  async deleteRequest(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    await apiService.delete(`/mentorship/${id}`, token);
  }

  async getAlumniList(): Promise<any[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.get<{ success: boolean; data: any[] }>('/users?role=alumni', token);
    return res.data;
  }
}

export const mentorshipApiService = new MentorshipApiService();
