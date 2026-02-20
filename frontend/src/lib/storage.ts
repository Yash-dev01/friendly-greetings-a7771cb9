import bcrypt from 'bcryptjs';
import type { User, Post, Event, Job, Newsletter, GalleryItem, Archive, GameScore, ChatLog, MentorshipRequest, MentorshipChat, MentorshipMessage } from '../types';
import {
  mockUsers,
  mockPosts,
  mockEvents,
  mockJobs,
  mockNewsletters,
  mockGalleryItems,
  mockArchives,
  mockGameScores,
  mockMentorshipRequests,
  hashedPassword
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'Alumni Connect_users',
  POSTS: 'Alumni Connect_posts',
  EVENTS: 'Alumni Connect_events',
  JOBS: 'Alumni Connect_jobs',
  NEWSLETTERS: 'Alumni Connect_newsletters',
  GALLERY: 'Alumni Connect_gallery',
  ARCHIVES: 'Alumni Connect_archives',
  GAME_SCORES: 'Alumni Connect_game_scores',
  CHAT_LOGS: 'Alumni Connect_chat_logs',
  MENTORSHIP: 'Alumni Connect_mentorship',
  MENTORSHIP_CHATS: 'Alumni Connect_mentorship_chats',
  CURRENT_USER: 'Alumni Connect_current_user'
};

class Storage {
  private initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setUsers(mockUsers.map(u => ({ ...u, passwordHash: hashedPassword })) as any);
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      this.setPosts(mockPosts);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.setEvents(mockEvents);
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      this.setJobs(mockJobs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEWSLETTERS)) {
      this.setNewsletters(mockNewsletters);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
      this.setGalleryItems(mockGalleryItems);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ARCHIVES)) {
      this.setArchives(mockArchives);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GAME_SCORES)) {
      this.setGameScores(mockGameScores);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENTORSHIP)) {
      this.setMentorshipRequests(mockMentorshipRequests);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.CHAT_LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENTORSHIP_CHATS)) {
      localStorage.setItem(STORAGE_KEYS.MENTORSHIP_CHATS, JSON.stringify([]));
    }
  }

  constructor() {
    this.initializeStorage();
  }

  getUsers(): (User & { passwordHash: string })[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  setUsers(users: (User & { passwordHash: string })[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getUserById(id: string): User | undefined {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return undefined;
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getPosts(): Post[] {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : [];
  }

  setPosts(posts: Post[]): void {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }

  addPost(post: Post): void {
    const posts = this.getPosts();
    posts.unshift(post);
    this.setPosts(posts);
  }

  getEvents(): Event[] {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  }

  setEvents(events: Event[]): void {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  addEvent(event: Event): void {
    const events = this.getEvents();
    events.push(event);
    this.setEvents(events);
  }

  getJobs(): Job[] {
    const data = localStorage.getItem(STORAGE_KEYS.JOBS);
    return data ? JSON.parse(data) : [];
  }

  setJobs(jobs: Job[]): void {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }

  addJob(job: Job): void {
    const jobs = this.getJobs();
    jobs.unshift(job);
    this.setJobs(jobs);
  }

  getNewsletters(): Newsletter[] {
    const data = localStorage.getItem(STORAGE_KEYS.NEWSLETTERS);
    return data ? JSON.parse(data) : [];
  }

  setNewsletters(newsletters: Newsletter[]): void {
    localStorage.setItem(STORAGE_KEYS.NEWSLETTERS, JSON.stringify(newsletters));
  }

  getGalleryItems(): GalleryItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
    return data ? JSON.parse(data) : [];
  }

  setGalleryItems(items: GalleryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
  }

  getArchives(): Archive[] {
    const data = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    return data ? JSON.parse(data) : [];
  }

  setArchives(archives: Archive[]): void {
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
  }

  getGameScores(): GameScore[] {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_SCORES);
    return data ? JSON.parse(data) : [];
  }

  setGameScores(scores: GameScore[]): void {
    localStorage.setItem(STORAGE_KEYS.GAME_SCORES, JSON.stringify(scores));
  }

  addGameScore(score: GameScore): void {
    const scores = this.getGameScores();
    scores.push(score);
    this.setGameScores(scores);
  }

  getChatLogs(userId: string): ChatLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_LOGS);
    const logs = data ? JSON.parse(data) : [];
    return logs.filter((log: ChatLog) => log.userId === userId);
  }

  addChatLog(log: ChatLog): void {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_LOGS);
    const logs = data ? JSON.parse(data) : [];
    logs.push(log);
    localStorage.setItem(STORAGE_KEYS.CHAT_LOGS, JSON.stringify(logs));
  }

  getMentorshipRequests(): MentorshipRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.MENTORSHIP);
    return data ? JSON.parse(data) : [];
  }

  setMentorshipRequests(requests: MentorshipRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.MENTORSHIP, JSON.stringify(requests));
  }

  addMentorshipRequest(request: MentorshipRequest): void {
    const requests = this.getMentorshipRequests();
    requests.push(request);
    this.setMentorshipRequests(requests);
  }

  updateMentorshipRequest(id: string, status: 'accepted' | 'declined'): void {
    const requests = this.getMentorshipRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index].status = status;
      this.setMentorshipRequests(requests);
    }
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  getMentorshipChats(): MentorshipChat[] {
    const data = localStorage.getItem(STORAGE_KEYS.MENTORSHIP_CHATS);
    return data ? JSON.parse(data) : [];
  }

  setMentorshipChats(chats: MentorshipChat[]): void {
    localStorage.setItem(STORAGE_KEYS.MENTORSHIP_CHATS, JSON.stringify(chats));
  }

  getMentorshipChatByRequestId(requestId: string): MentorshipChat | undefined {
    const chats = this.getMentorshipChats();
    return chats.find(c => c.mentorshipRequestId === requestId);
  }

  getOrCreateMentorshipChat(requestId: string, studentId: string, alumniId: string): MentorshipChat {
    const existingChat = this.getMentorshipChatByRequestId(requestId);
    if (existingChat) {
      return existingChat;
    }

    const newChat: MentorshipChat = {
      id: Date.now().toString(),
      mentorshipRequestId: requestId,
      studentId,
      alumniId,
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageTime: new Date().toISOString()
    };

    const chats = this.getMentorshipChats();
    chats.push(newChat);
    this.setMentorshipChats(chats);
    return newChat;
  }

  addMentorshipMessage(chatId: string, senderId: string, content: string): MentorshipMessage {
    const chats = this.getMentorshipChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);

    if (chatIndex === -1) {
      throw new Error('Chat not found');
    }

    const message: MentorshipMessage = {
      id: Date.now().toString(),
      senderId,
      content,
      createdAt: new Date().toISOString()
    };

    chats[chatIndex].messages.push(message);
    chats[chatIndex].lastMessageTime = message.createdAt;
    this.setMentorshipChats(chats);
    return message;
  }

  async login(email: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    this.setCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  }

  logout(): void {
    this.setCurrentUser(null);
  }
}

export const storage = new Storage();
