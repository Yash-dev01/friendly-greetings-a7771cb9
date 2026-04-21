import { apiService } from './api';
import { authService } from './authService';

export interface TeamMember {
  email: string;
  userId?: { _id: string; fullName?: string; email?: string; avatarUrl?: string; role?: string } | string;
  fullName?: string;
  invited?: boolean;
  joinedAt?: string;
}

export interface Team {
  _id: string;
  name: string;
  purpose?: string;
  requestedBy: { _id: string; fullName: string; email: string; avatarUrl?: string; company?: string } | string;
  members: TeamMember[];
  permissions: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  durationDays?: number;
  startsAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface WorkspaceTask {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  assignedTo?: any;
  createdBy?: any;
  dueDate?: string;
  createdAt: string;
}

export interface WorkspaceNote {
  _id: string;
  title?: string;
  content: string;
  authorId?: any;
  createdAt: string;
}

export interface WorkspaceMessage {
  _id: string;
  senderId: any;
  content: string;
  createdAt: string;
}

export interface RoadmapItem {
  _id: string;
  title: string;
  description?: string;
  stage: 'planned' | 'in_progress' | 'completed';
  targetDate?: string;
}

export interface WhiteboardStroke {
  _id?: string;
  color: string;
  width: number;
  points: number[][];
  authorId?: any;
}

export interface ActivityEntry {
  _id: string;
  userId: any;
  action: string;
  meta?: any;
  createdAt: string;
}

export interface Workspace {
  _id: string;
  teamId: string;
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  messages: WorkspaceMessage[];
  activity: ActivityEntry[];
  roadmap: RoadmapItem[];
  whiteboard: WhiteboardStroke[];
}

const tk = () => authService.getToken() || undefined;

class TeamService {
  // Alumni
  createRequest(payload: { name: string; purpose?: string; memberEmails: string[]; permissions?: string[] }) {
    return apiService.post<{ success: boolean; data: Team }>('/teams/request', payload, tk());
  }
  myRequests() {
    return apiService.get<{ success: boolean; data: Team[] }>('/teams/mine', tk()).then((r) => r.data);
  }
  myActiveTeams() {
    return apiService.get<{ success: boolean; data: Team[] }>('/teams/active', tk()).then((r) => r.data);
  }

  // Admin
  allRequests(status?: string) {
    const q = status ? `?status=${status}` : '';
    return apiService.get<{ success: boolean; data: Team[] }>(`/teams/requests${q}`, tk()).then((r) => r.data);
  }
  approve(id: string, durationDays: number) {
    return apiService.put<{ success: boolean; data: Team }>(`/teams/${id}/approve`, { durationDays }, tk());
  }
  reject(id: string, reason?: string) {
    return apiService.put<{ success: boolean; data: Team }>(`/teams/${id}/reject`, { reason }, tk());
  }

  getById(id: string) {
    return apiService.get<{ success: boolean; data: Team }>(`/teams/${id}`, tk()).then((r) => r.data);
  }

  // Workspace
  getWorkspace(teamId: string) {
    return apiService.get<{ success: boolean; data: Workspace }>(`/teams/${teamId}/workspace`, tk()).then((r) => r.data);
  }
  addTask(teamId: string, payload: Partial<WorkspaceTask>) {
    return apiService.post<{ success: boolean; data: WorkspaceTask }>(`/teams/${teamId}/tasks`, payload, tk()).then((r) => r.data);
  }
  updateTask(teamId: string, taskId: string, payload: Partial<WorkspaceTask>) {
    return apiService.put<{ success: boolean; data: WorkspaceTask }>(`/teams/${teamId}/tasks/${taskId}`, payload, tk()).then((r) => r.data);
  }
  deleteTask(teamId: string, taskId: string) {
    return apiService.delete(`/teams/${teamId}/tasks/${taskId}`, tk());
  }
  addNote(teamId: string, payload: Partial<WorkspaceNote>) {
    return apiService.post<{ success: boolean; data: WorkspaceNote }>(`/teams/${teamId}/notes`, payload, tk()).then((r) => r.data);
  }
  deleteNote(teamId: string, noteId: string) {
    return apiService.delete(`/teams/${teamId}/notes/${noteId}`, tk());
  }
  sendMessage(teamId: string, content: string) {
    return apiService.post<{ success: boolean; data: WorkspaceMessage }>(`/teams/${teamId}/messages`, { content }, tk()).then((r) => r.data);
  }
  addRoadmap(teamId: string, payload: Partial<RoadmapItem>) {
    return apiService.post<{ success: boolean; data: RoadmapItem }>(`/teams/${teamId}/roadmap`, payload, tk()).then((r) => r.data);
  }
  updateRoadmap(teamId: string, itemId: string, payload: Partial<RoadmapItem>) {
    return apiService.put<{ success: boolean; data: RoadmapItem }>(`/teams/${teamId}/roadmap/${itemId}`, payload, tk()).then((r) => r.data);
  }
  deleteRoadmap(teamId: string, itemId: string) {
    return apiService.delete(`/teams/${teamId}/roadmap/${itemId}`, tk());
  }
  addStroke(teamId: string, stroke: WhiteboardStroke) {
    return apiService.post<{ success: boolean; data: WhiteboardStroke }>(`/teams/${teamId}/whiteboard`, stroke, tk()).then((r) => r.data);
  }
  clearWhiteboard(teamId: string) {
    return apiService.delete(`/teams/${teamId}/whiteboard`, tk());
  }
}

export const teamService = new TeamService();
