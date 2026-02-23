// services/analyticsService.ts
import { apiService } from "./api";

export interface UserAnalytics {
  totalUsers: number;
  alumniCount: number;
  studentCount: number;
  mentors: number;
  departmentStats: { _id: string; count: number }[];
  graduationStats: { _id: number; count: number }[];
}

export interface EngagementAnalytics {
  totalPosts: number;
  recentPosts: any[]; // Replace 'any' with your Post type
  topActivityUsers: { _id: string; totalScore: number }[];
}

export interface EventAnalytics {
  totalEvents: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  monthlyStats: { _id: number; count: number }[];
}

export interface JobAnalytics {
  totalJobs: number;
  activeJobs: number;
  jobsPerMonth: { _id: number; count: number }[];
}

class AnalyticsService {
  async getUserAnalytics(): Promise<UserAnalytics> {
    return apiService.get<UserAnalytics>("/analytics/users");
  }

  async getEngagementAnalytics(): Promise<EngagementAnalytics> {
    return apiService.get<EngagementAnalytics>("/analytics/engagement");
  }

  async getEventAnalytics(): Promise<EventAnalytics> {
    return apiService.get<EventAnalytics>("/analytics/events");
  }

  async getJobAnalytics(): Promise<JobAnalytics> {
    return apiService.get<JobAnalytics>("/analytics/jobs");
  }
}

export const analyticsService = new AnalyticsService();
