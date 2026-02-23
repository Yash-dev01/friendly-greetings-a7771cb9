export type UserRole = 'admin' | 'alumni' | 'student';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  graduationYear?: number;
  department?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  user?: User;
  title: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  createdBy: string;
  attendeesCount: number;
  createdAt: string;
}

export interface Job {
  id: string;
  postedBy: string;
  postedByUser?: User;
  company: string;
  role: string;
  location: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Newsletter {
  id: string;
  title: string;
  content: string;
  publishedDate: string;
  createdBy: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  uploadedBy: string;
  createdAt: string;
}

export interface Archive {
  id: string;
  title: string;
  description: string;
  year: number;
  category: string;
  createdAt: string;
}

export interface GameScore {
  id: string;
  userId: string;
  user?: User;
  gameType: '8queens' | 'sudoku';
  score: number;
  timeTaken: number;
  createdAt: string;
}

export interface ChatLog {
  id: string;
  userId: string;
  message: string;
  response: string;
  createdAt: string;
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  student?: User;
  alumniId: string;
  alumni?: User;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
}

export interface MentorshipChat {
  id: string;
  mentorshipRequestId: string;
  studentId: string;
  alumniId: string;
  messages: MentorshipMessage[];
  createdAt: string;
  lastMessageTime: string;
}

export interface MentorshipMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}
