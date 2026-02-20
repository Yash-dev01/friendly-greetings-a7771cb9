import { apiService } from "./api";
import { authService } from "./authService";

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'alumni' | 'student';
  graduationYear?: number;
  department?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class UserManagementService {
  // 🟩 Get all users with optional filters
 async getUsers(filters?: { role?: string; isActive?: boolean | string }): Promise<User[]> {
  const token = authService.getToken();
  const queryParams = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }

  const query = queryParams.toString();
  const endpoint = `/users${query ? `?${query}` : ""}`;

  const res = await apiService.get<{ data: User[] }>(endpoint, token || undefined);
  return res.data || [];
}


  // 📄 Get single user details
  async getUserById(id: string): Promise<User> {
    const token = authService.getToken();
    return apiService.get<User>(`/users/${id}`, token || undefined);
  }

  // ✳ Create a new user (admin only)
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<User> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");
    return apiService.post<User>("/users", userData, token);
  }

  // 🔄 Update a user
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");
    return apiService.put<User>(`/users/${id}`, userData, token);
  }

  // ❌ Delete a user
  async deleteUser(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");
    return apiService.delete(`/users/${id}`, token);
  }

  // 📤 Bulk upload users via Excel
  async bulkUploadUsers(file: File): Promise<{ imported: number; failed: number; errors: any[] }> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    const formData = new FormData();
    formData.append("file", file);

    return apiService.post("/users/upload-excel", formData, token);

  }
}

export const userManagementService = new UserManagementService();
