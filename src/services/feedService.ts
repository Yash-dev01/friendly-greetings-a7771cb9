import axios from 'axios';

export type FeedType = 'post' | 'job' | 'event' | 'newsletter';

export interface FeedItem {
  _id: string;
  type: FeedType;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  location?: string;
  company?: string;
  salaryRange?: string;
  user?: any;
  likeCount?: number;
  commentCount?: number;
}

const BASE_URL = 'http://localhost:5000/api';

export const feedService = {
  getFeed: async (type: 'all' | 'posts' | 'jobs' | 'events' = 'all'): Promise<FeedItem[]> => {
    try {
      const token = localStorage.getItem('token'); // get JWT from localStorage
      const res = await axios.get<{ success: boolean; data: FeedItem[] }>(
        `${BASE_URL}/feed?type=${type}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      return res.data.data;
    } catch (err: any) {
      console.error('Error fetching feed:', err.response?.data || err.message);
      return [];
    }
  },
};
