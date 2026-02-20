import { apiService } from './api';

export interface DashboardData {
  jobs: { _id: string; role: string; company: string; location: string }[];
  posts: { _id: string; title: string }[];
  events: { _id: string; title: string; eventDate: string }[];
}

export const dashboardService = {
  getHomeDashboard(token?: string) {
    return apiService.get<{ success: boolean; data: DashboardData }>(
      '/dashboard/home',
      token
    );
  },
};
