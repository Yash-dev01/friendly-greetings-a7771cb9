import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
      this.socket?.emit('register', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinChat(conversationId: string): void {
    this.socket?.emit('join_chat', conversationId);
  }

  leaveChat(conversationId: string): void {
    this.socket?.emit('leave_chat', conversationId);
  }

  sendMessage(data: { conversationId: string; senderId: string; content: string; createdAt: string }): void {
    this.socket?.emit('send_message', data);
  }

  onReceiveMessage(callback: (data: any) => void): void {
    this.socket?.on('receive_message', callback);
  }

  offReceiveMessage(): void {
    this.socket?.off('receive_message');
  }

  emitTyping(data: { conversationId: string; userId: string; fullName: string }): void {
    this.socket?.emit('typing', data);
  }

  emitStopTyping(data: { conversationId: string; userId: string }): void {
    this.socket?.emit('stop_typing', data);
  }

  onUserTyping(callback: (data: any) => void): void {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: any) => void): void {
    this.socket?.on('user_stop_typing', callback);
  }
}

export const socketService = new SocketService();
