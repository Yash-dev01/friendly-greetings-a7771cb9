import { apiService } from "./api";
import { authService } from "./authService";

export interface Job {
  _id: string;
  postedBy: {
    _id: string;
    fullName: string;
    email: string;
    company?: string;
    position?: string;
    avatarUrl?: string;
  };
  company: string;
  role: string;
  location: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  employmentType: "full-time" | "part-time" | "contract" | "internship";
  applyLink?: string;
  isActive: boolean;
  applications: {
    userId: {
      _id: string;
      fullName: string;
      email: string;
      avatarUrl?: string;
    };
    appliedAt: string;
    status: "pending" | "reviewed" | "accepted" | "rejected";
  }[];
  createdAt: string;
  updatedAt: string;
}

class JobManagementService {
  // 🟩 Get all jobs with optional filters
async getJobs(filters?: { location?: string; role?: string; company?: string; isActive?: boolean | string; }): Promise<Job[]> {
  const token = authService.getToken();

  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") queryParams.append(k, v.toString());
    });
  }

  const query = queryParams.toString();
  const endpoint = `/jobs${query ? `?${query}` : ""}`;

  const response = await apiService.get<any>(endpoint, token || undefined);

  return response?.data ?? []; // ← return only job array
}



  // 📄 Get single job details
  async getJobById(id: string): Promise<Job> {
    const token = authService.getToken();
    return apiService.get<Job>(`/jobs/${id}`, token || undefined);
  }

  // ✳ Create a new job (Admin/User with permission)
  async createJob(jobData: Omit<Job, "_id" | "applications" | "createdAt" | "updatedAt" | "isActive" | "postedBy">): Promise<Job> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    return apiService.post<Job>("/jobs", jobData, token);
  }

  // 🔄 Update a job
  async updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    return apiService.put<Job>(`/jobs/${id}`, jobData, token);
  }

  // ❌ Delete job
  async deleteJob(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    return apiService.delete(`/jobs/${id}`, token);
  }

  // 📝 Apply to job
  async applyToJob(id: string): Promise<Job> {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    return apiService.post<Job>(`/jobs/${id}/apply`, {}, token);
  }
}

export const jobManagementService = new JobManagementService();
