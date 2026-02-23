import { apiService } from './api';
import { authService } from './authService';

export interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  attendees: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  }[];
  attendeesCount?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class EventService {
  // Get all events, optionally filter upcoming only
  async getEvents(upcoming?: boolean): Promise<Event[]> {
    const token = authService.getToken();
    const query = upcoming ? `?upcoming=true` : '';
    return apiService.get<Event[]>(`/events${query}`, token || undefined);
  }

  // Get single event by ID
  async getEventById(id: string): Promise<Event> {
    const token = authService.getToken();
    return apiService.get<Event>(`/events/${id}`, token || undefined);
  }

  // Create new event (admin only)
  async createEvent(eventData: {
    title: string;
    description: string;
    eventDate: string;
    location: string;
    imageUrl?: string;
  }): Promise<Event> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<Event>('/events', eventData, token);
  }

  // Update event (admin only)
  async updateEvent(
    id: string,
    eventData: Partial<{
      title: string;
      description: string;
      eventDate: string;
      location: string;
      imageUrl?: string;
    }>
  ): Promise<Event> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.put<Event>(`/events/${id}`, eventData, token);
  }

  // Delete event (admin only)
  async deleteEvent(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.delete(`/events/${id}`, token);
  }

  // Attend or leave event (toggle attendance)
  async toggleAttendance(eventId: string): Promise<Event> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    return apiService.post<Event>(`/events/${eventId}/attend`, {}, token);
  }
}

export const eventService = new EventService();






// import { apiService } from './api';
// import { authService } from './authService';

// export interface Event {
//   id: string;
//   title: string;
//   description: string;
//   eventDate: string;
//   eventTime: string;
//   location: string;
//   type: 'networking' | 'workshop' | 'reunion' | 'webinar' | 'career-fair' | 'other';
//   organizer: {
//     id: string;
//     name: string;
//     email: string;
//   };
//   maxAttendees?: number;
//   currentAttendees: number;
//   registrationDeadline?: string;
//   isVirtual: boolean;
//   meetingLink?: string;
//   image?: string;
//   status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
//   tags?: string[];
// }

// export interface EventRegistration {
//   eventId: string;
//   userId: string;
//   registeredAt: string;
//   status: 'registered' | 'attended' | 'cancelled';
// }

// class EventService {
//   async getEvents(filters?: {
//     type?: string;
//     status?: string;
//     upcoming?: boolean;
//   }): Promise<Event[]> {
//     const token = authService.getToken();
//     const queryParams = new URLSearchParams();

//     if (filters) {
//       Object.entries(filters).forEach(([key, value]) => {
//         if (value !== undefined && value !== null) {
//           queryParams.append(key, value.toString());
//         }
//       });
//     }

//     const query = queryParams.toString();
//     const endpoint = `/events${query ? `?${query}` : ''}`;

//     return apiService.get<Event[]>(endpoint, token || undefined);
//   }

//   async getEventById(id: string): Promise<Event> {
//     const token = authService.getToken();
//     return apiService.get<Event>(`/events/${id}`, token || undefined);
//   }

//   async createEvent(eventData: Omit<Event, 'id' | 'currentAttendees'>): Promise<Event> {
//     const token = authService.getToken();
//     if (!token) throw new Error('Authentication required');
//     return apiService.post<Event>('/events', eventData, token);
//   }

//   async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
//     const token = authService.getToken();
//     if (!token) throw new Error('Authentication required');
//     return apiService.put<Event>(`/events/${id}`, eventData, token);
//   }

//   async deleteEvent(id: string): Promise<{ message: string }> {
//     const token = authService.getToken();
//     if (!token) throw new Error('Authentication required');
//     return apiService.delete(`/events/${id}`, token);
//   }

//   async registerForEvent(eventId: string): Promise<EventRegistration> {
//     const token = authService.getToken();
//     if (!token) throw new Error('Authentication required');
//     return apiService.post<EventRegistration>(
//       `/events/${eventId}/register`,
//       {},
//       token
//     );
//   }

//   async cancelRegistration(eventId: string): Promise<{ message: string }> {
//     const token = authService.getToken();
//     if (!token) throw new Error('Authentication required');
//     return apiService.delete(`/events/${eventId}/register`, token);
//   }

//   async getMyRegistrations(): Promise<EventRegistration[]> {
//     const token = authService.getToken();
//     if (!token) throw new Error('Authentication required');
//     return apiService.get<EventRegistration[]>('/events/my-registrations', token);
//   }
// }

// export const eventService = new EventService();
