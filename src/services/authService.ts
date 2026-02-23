import { apiService } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  graduationYear?: number;
  role?: 'student' | 'alumni' | 'admin'; // <-- add this
  department?: string;
}

export interface BackendRegisterResponse {
  _id: string;
  email: string;
  fullName: string;
  role: 'student' | 'alumni' | 'admin';
  graduationYear?: number;
  department?: string;
  token: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  graduationYear?: number;
  department?: string;
  profileImage?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'alumni' | 'student' | 'admin';
  company?: string;
  position?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private tokenKey = 'auth_token';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    this.setToken(response.token);
    return response;
  }

 async register(data: RegisterData): Promise<AuthResponse> {
  const res = await apiService.post<BackendRegisterResponse>('/auth/register', data);

  const user: User = {
    id: res._id,
    email: res.email,
    firstName: res.fullName.split(" ")[0] || "",
    lastName: res.fullName.split(" ")[1] || "",
    role: res.role,
    graduationYear: res.graduationYear,
    department: res.department,
  };

  this.setToken(res.token);

  return { user, token: res.token };
}


  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await apiService.post('/auth/logout', {}, token);
    }
    this.removeToken();
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return apiService.get<User>('/auth/me', token);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiService.post('/auth/reset-password', { token, newPassword });
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
