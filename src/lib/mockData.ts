import bcrypt from 'bcryptjs';
import type { User, Post, Event, Job, Newsletter, GalleryItem, Archive, GameScore, MentorshipRequest } from '../types';

const hashedPassword = bcrypt.hashSync('password123', 10);

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@Alumni Connect.com', password: 'password123' },
  alumni: { email: 'alumni@Alumni Connect.com', password: 'password123' },
  student: { email: 'student@Alumni Connect.com', password: 'password123' }
};

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@Alumni Connect.com',
    fullName: 'John Admin',
    role: 'admin',
    department: 'Administration',
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'alumni@Alumni Connect.com',
    fullName: 'Sarah Thompson',
    role: 'alumni',
    graduationYear: 2018,
    department: 'Computer Science',
    company: 'Tech Corp',
    position: 'Senior Software Engineer',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'student@Alumni Connect.com',
    fullName: 'Michael Chen',
    role: 'student',
    graduationYear: 2025,
    department: 'Computer Science',
    avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    email: 'emily.parker@Alumni Connect.com',
    fullName: 'Emily Parker',
    role: 'alumni',
    graduationYear: 2016,
    department: 'Business',
    company: 'StartupXYZ',
    position: 'Product Manager',
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    email: 'david.kumar@Alumni Connect.com',
    fullName: 'David Kumar',
    role: 'alumni',
    graduationYear: 2019,
    department: 'Engineering',
    company: 'Global Industries',
    position: 'Engineering Manager',
    avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date().toISOString()
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '2',
    title: 'Excited to announce my new role at Tech Corp!',
    content: 'After 5 amazing years at my previous company, I am thrilled to join Tech Corp as a Senior Software Engineer. Looking forward to this new chapter!',
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    likesCount: 24,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    userId: '4',
    title: 'Our startup just raised Series A!',
    content: 'Incredibly proud to share that StartupXYZ has raised $10M in Series A funding. Thanks to everyone who believed in our vision!',
    imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    likesCount: 56,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Alumni Reunion 2025',
    description: 'Join us for our annual alumni reunion featuring networking, guest speakers, and campus tours.',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Main Campus Auditorium',
    createdBy: '1',
    attendeesCount: 145,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Tech Career Fair',
    description: 'Connect with leading tech companies and explore career opportunities.',
    eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Student Center Hall A',
    createdBy: '1',
    attendeesCount: 89,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Mentorship Kickoff Session',
    description: 'Launch of the 2025 mentorship program connecting students with alumni mentors.',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Virtual Event (Zoom)',
    createdBy: '1',
    attendeesCount: 67,
    createdAt: new Date().toISOString()
  }
];

export const mockJobs: Job[] = [
  {
    id: '1',
    postedBy: '2',
    company: 'Tech Corp',
    role: 'Software Engineer',
    location: 'San Francisco, CA',
    description: 'We are looking for talented software engineers to join our growing team.',
    requirements: 'BS in Computer Science or related field, 2+ years experience with React and Node.js',
    salaryRange: '$120k - $160k',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    postedBy: '4',
    company: 'StartupXYZ',
    role: 'Product Designer',
    location: 'Remote',
    description: 'Join our product team to design innovative solutions for our growing user base.',
    requirements: 'Portfolio showcasing UX/UI work, experience with Figma, understanding of design systems',
    salaryRange: '$100k - $130k',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    postedBy: '5',
    company: 'Global Industries',
    role: 'Data Analyst',
    location: 'New York, NY',
    description: 'Seeking a data analyst to drive insights and support strategic decision-making.',
    requirements: 'Experience with SQL, Python, and data visualization tools. Strong analytical skills.',
    salaryRange: '$90k - $120k',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const mockNewsletters: Newsletter[] = [
  {
    id: '1',
    title: 'Spring 2025 Newsletter',
    content: 'Welcome to the Spring 2025 edition of the Alumni Connect newsletter! This quarter has been incredible...',
    publishedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: '1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Winter 2024 Newsletter',
    content: 'As we close out 2024, we reflect on an amazing year of growth and connection...',
    publishedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: '1',
    createdAt: new Date().toISOString()
  }
];

export const mockGalleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Graduation Day 2024',
    description: 'Celebrating the Class of 2024',
    mediaUrl: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800',
    mediaType: 'photo',
    uploadedBy: '1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Campus Tour',
    description: 'A walk through our beautiful campus',
    mediaUrl: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800',
    mediaType: 'photo',
    uploadedBy: '1',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Alumni Meet 2024',
    description: 'Alumni gathering and networking event',
    mediaUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    mediaType: 'photo',
    uploadedBy: '2',
    createdAt: new Date().toISOString()
  }
];

export const mockArchives: Archive[] = [
  {
    id: '1',
    title: 'National Award for Excellence',
    description: 'Our institution received the National Award for Excellence in Education.',
    year: 2024,
    category: 'Awards',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Research Breakthrough in AI',
    description: 'Dr. Smith published groundbreaking research on machine learning applications.',
    year: 2023,
    category: 'Research',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'New Engineering Building',
    description: 'Inauguration of the state-of-the-art engineering complex.',
    year: 2022,
    category: 'Infrastructure',
    createdAt: new Date().toISOString()
  }
];

export const mockGameScores: GameScore[] = [
  {
    id: '1',
    userId: '3',
    gameType: '8queens',
    score: 100,
    timeTaken: 145,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '2',
    gameType: 'sudoku',
    score: 95,
    timeTaken: 210,
    createdAt: new Date().toISOString()
  }
];

export const mockMentorshipRequests: MentorshipRequest[] = [
  {
    id: '1',
    studentId: '3',
    alumniId: '2',
    status: 'accepted',
    message: 'Hi Sarah, I would love to learn more about your career path in software engineering.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export { hashedPassword };
