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
  offUserTyping() {
  this.socket?.off('userTyping');
}

offUserStopTyping() {
  this.socket?.off('userStopTyping');
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

  // ============= TEAM ROOMS =============
  joinTeam(teamId: string): void {
    this.socket?.emit('team:join', teamId);
  }
  leaveTeam(teamId: string): void {
    this.socket?.emit('team:leave', teamId);
  }
  sendTeamMessage(data: { teamId: string; message: any }): void {
    this.socket?.emit('team:message', data);
  }
  onTeamMessage(cb: (data: any) => void): void {
    this.socket?.on('team:message', cb);
  }
  offTeamMessage(): void {
    this.socket?.off('team:message');
  }
  emitWhiteboardStroke(data: { teamId: string; stroke: any }): void {
    this.socket?.emit('team:whiteboard:stroke', data);
  }
  onWhiteboardStroke(cb: (data: any) => void): void {
    this.socket?.on('team:whiteboard:stroke', cb);
  }
  offWhiteboardStroke(): void {
    this.socket?.off('team:whiteboard:stroke');
  }
  emitWhiteboardClear(data: { teamId: string }): void {
    this.socket?.emit('team:whiteboard:clear', data);
  }
  onWhiteboardClear(cb: (data: any) => void): void {
    this.socket?.on('team:whiteboard:clear', cb);
  }
  offWhiteboardClear(): void {
    this.socket?.off('team:whiteboard:clear');
  }
}

export const socketService = new SocketService();
