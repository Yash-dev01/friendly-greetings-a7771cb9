import { apiService } from './api';
import { authService } from './authService';

export interface Job {
  _id: string;
  id?: string;
  title: string;
  role: string;
  company: string;
  location: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  employmentType?: string;
  department?: string;
  description: string;
  requirements?: string[] | string;
  responsibilities?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  salaryRange?: string;
  postedBy?: {
    id: string;
    name: string;
    email: string;
  };
  postedAt?: string;
  applicationDeadline?: string;
  status?: 'active' | 'closed' | 'filled';
  isActive?: boolean;
  applyLink?: string;
  tags?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  resume: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
}

class JobService {
  async getJobs(filters?: {
    type?: string;
    department?: string;
    location?: string;
    experienceLevel?: string;
    status?: string;
  }): Promise<Job[]> {
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
    const endpoint = `/jobs${query ? `?${query}` : ''}`;

    return apiService.get<Job[]>(endpoint, token || undefined);
  }

  async getJobById(id: string): Promise<Job> {
    const token = authService.getToken();
    return apiService.get<Job>(`/jobs/${id}`, token || undefined);
  }

  async createJob(jobData: Omit<Job, 'id' | 'postedAt'>): Promise<Job> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<Job>('/jobs', jobData, token);
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.put<Job>(`/jobs/${id}`, jobData, token);
  }

  async deleteJob(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.delete(`/jobs/${id}`, token);
  }

  async applyForJob(
    jobId: string,
    application: Omit<JobApplication, 'id' | 'jobId' | 'applicantId' | 'appliedAt' | 'status'>
  ): Promise<JobApplication> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<JobApplication>(
      `/jobs/${jobId}/apply`,
      application,
      token
    );
  }

  async getMyApplications(): Promise<JobApplication[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.get<JobApplication[]>('/jobs/my-applications', token);
  }

  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.get<JobApplication[]>(
      `/jobs/${jobId}/applications`,
      token
    );
  }

  async updateApplicationStatus(
    applicationId: string,
    status: JobApplication['status']
  ): Promise<JobApplication> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.patch<JobApplication>(
      `/jobs/applications/${applicationId}`,
      { status },
      token
    );
  }
}

export const jobService = new JobService();
