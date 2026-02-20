import { apiService } from './api';
import { authService } from './authService';

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  expertise: string[];
  bio: string;
  currentCompany?: string;
  currentPosition?: string;
  yearsOfExperience: number;
  availability: 'available' | 'limited' | 'unavailable';
  maxMentees: number;
  currentMentees: number;
  profileImage?: string;
  linkedin?: string;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  menteeName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  requestedAt: string;
  respondedAt?: string;
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // in minutes
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

class MentorshipService {
  async getMentors(filters?: {
    expertise?: string[];
    availability?: string;
  }): Promise<MentorProfile[]> {
    const token = authService.getToken();
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.expertise && filters.expertise.length > 0) {
        queryParams.append('expertise', filters.expertise.join(','));
      }
      if (filters.availability) {
        queryParams.append('availability', filters.availability);
      }
    }

    const query = queryParams.toString();
    const endpoint = `/mentorship/mentors${query ? `?${query}` : ''}`;

    return apiService.get<MentorProfile[]>(endpoint, token || undefined);
  }

  async getMentorById(id: string): Promise<MentorProfile> {
    const token = authService.getToken();
    return apiService.get<MentorProfile>(
      `/mentorship/mentors/${id}`,
      token || undefined
    );
  }

  async createMentorProfile(
    profileData: Omit<MentorProfile, 'id' | 'userId' | 'currentMentees'>
  ): Promise<MentorProfile> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<MentorProfile>(
      '/mentorship/mentors',
      profileData,
      token
    );
  }

  async updateMentorProfile(
    id: string,
    profileData: Partial<MentorProfile>
  ): Promise<MentorProfile> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.put<MentorProfile>(
      `/mentorship/mentors/${id}`,
      profileData,
      token
    );
  }

  async requestMentorship(
    mentorId: string,
    message: string
  ): Promise<MentorshipRequest> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<MentorshipRequest>(
      '/mentorship/requests',
      { mentorId, message },
      token
    );
  }

  async respondToRequest(
    requestId: string,
    status: 'accepted' | 'rejected'
  ): Promise<MentorshipRequest> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.patch<MentorshipRequest>(
      `/mentorship/requests/${requestId}`,
      { status },
      token
    );
  }

  async getMyRequests(): Promise<MentorshipRequest[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.get<MentorshipRequest[]>(
      '/mentorship/my-requests',
      token
    );
  }

  async getPendingRequests(): Promise<MentorshipRequest[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.get<MentorshipRequest[]>(
      '/mentorship/pending-requests',
      token
    );
  }

  async scheduleMentorshipSession(
    sessionData: Omit<MentorshipSession, 'id' | 'status'>
  ): Promise<MentorshipSession> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<MentorshipSession>(
      '/mentorship/sessions',
      sessionData,
      token
    );
  }

  async getMySessions(): Promise<MentorshipSession[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.get<MentorshipSession[]>(
      '/mentorship/my-sessions',
      token
    );
  }

  async updateSession(
    sessionId: string,
    updates: Partial<MentorshipSession>
  ): Promise<MentorshipSession> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.patch<MentorshipSession>(
      `/mentorship/sessions/${sessionId}`,
      updates,
      token
    );
  }

  async cancelSession(sessionId: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.delete(`/mentorship/sessions/${sessionId}`, token);
  }
}

export const mentorshipService = new MentorshipService();
