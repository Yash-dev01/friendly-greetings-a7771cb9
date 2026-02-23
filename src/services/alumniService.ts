import { apiService } from './api';
import { authService } from './authService';

export interface Alumni {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: number;
  department: string;
  currentCompany?: string;
  currentPosition?: string;
  location?: string;
  profileImage?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  skills?: string[];
  interests?: string[];
}

export interface AlumniFilters {
  department?: string;
  graduationYear?: number;
  location?: string;
  company?: string;
  skills?: string[];
  search?: string;
}

class AlumniService {
  async getAlumniList(filters?: AlumniFilters): Promise<Alumni[]> {
    const token = authService.getToken();
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = `/alumni${query ? `?${query}` : ''}`;

    return apiService.get<Alumni[]>(endpoint, token || undefined);
  }

  async getAlumniById(id: string): Promise<Alumni> {
    const token = authService.getToken();
    return apiService.get<Alumni>(`/alumni/${id}`, token || undefined);
  }

  async updateAlumniProfile(id: string, data: Partial<Alumni>): Promise<Alumni> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.put<Alumni>(`/alumni/${id}`, data, token);
  }

  async deleteAlumniProfile(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.delete(`/alumni/${id}`, token);
  }

  async searchAlumni(searchTerm: string): Promise<Alumni[]> {
    const token = authService.getToken();
    return apiService.get<Alumni[]>(
      `/alumni/search?q=${encodeURIComponent(searchTerm)}`,
      token || undefined
    );
  }
}

export const alumniService = new AlumniService();
