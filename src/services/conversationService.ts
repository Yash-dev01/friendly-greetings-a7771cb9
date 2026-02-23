import { apiService } from './api';
import { authService } from './authService';

export interface ConversationMessage {
  _id: string;
  senderId: string | { _id: string; fullName: string; avatarUrl?: string };
  content: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    company?: string;
    position?: string;
  }[];
  messages: ConversationMessage[];
  lastMessage?: string;
  lastMessageTime: string;
  createdAt: string;
}

class ConversationService {
  async getConversations(): Promise<Conversation[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.get<{ success: boolean; data: Conversation[] }>('/conversations', token);
    return res.data;
  }

  async getConversationById(id: string): Promise<Conversation> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.get<{ success: boolean; data: Conversation }>(`/conversations/${id}`, token);
    return res.data;
  }

  async createConversation(otherUserId: string): Promise<Conversation> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: Conversation }>('/conversations', { otherUserId }, token);
    return res.data;
  }

  async sendMessage(conversationId: string, content: string): Promise<Conversation> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    const res = await apiService.post<{ success: boolean; data: Conversation }>(
      `/conversations/${conversationId}/messages`,
      { content },
      token
    );
    return res.data;
  }

  async markAsRead(conversationId: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    await apiService.put(`/conversations/${conversationId}/read`, {}, token);
  }
}

export const conversationService = new ConversationService();
