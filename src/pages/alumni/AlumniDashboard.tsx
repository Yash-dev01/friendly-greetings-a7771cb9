import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { MentorshipChat } from '../../components/MentorshipChat';
import { Briefcase, Calendar, Heart, MessageSquare, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { mentorshipApiService, MentorshipRequestData } from '../../services/mentorshipApiService';
import { conversationService } from '../../services/conversationService';
import { socketService } from '../../services/socketService';
import { jobService, Job } from '../../services/jobService';
import { apiService } from '../../services/api';
import { authService } from '../../services/authService';

export function AlumniDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequestData[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [chatState, setChatState] = useState<{
    conversationId: string;
    otherUser: { _id: string; fullName: string; avatarUrl?: string; company?: string; position?: string };
  } | null>(null);

  const [jobForm, setJobForm] = useState({
    company: user?.company || '',
    role: '',
    location: '',
    description: '',
    requirements: '',
    salaryRange: '',
    employmentType: 'full-time',
    applyLink: '',
  });

  useEffect(() => {
    if (user?.id) socketService.connect(user.id);
    fetchAll();
    return () => { socketService.disconnect(); };
  }, [user]);

  const fetchAll = async () => {
    try {
      const token = authService.getToken();
      const [requestsData, jobsRes, eventsRes, postsRes] = await Promise.all([
        mentorshipApiService.getRequests(),
        jobService.getJobs(),
        apiService.get<{ success: boolean; data: any[] }>('/events', token || undefined).catch(() => ({ data: [] })),
        apiService.get<{ success: boolean; data: any[] }>('/posts', token || undefined).catch(() => ({ data: [] })),
      ]);
      setMentorshipRequests(requestsData);
      const jobList = Array.isArray(jobsRes) ? jobsRes : (jobsRes as any).data || [];
      setJobs(jobList);
      setEvents((eventsRes as any).data || []);
      setPosts((postsRes as any).data || []);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async () => {
    if (!jobForm.role || !jobForm.company || !jobForm.location || !jobForm.description || !jobForm.requirements) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await jobService.createJob(jobForm as any);
      setIsJobModalOpen(false);
      setJobForm({ company: user?.company || '', role: '', location: '', description: '', requirements: '', salaryRange: '', employmentType: 'full-time', applyLink: '' });
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Failed to post job');
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await mentorshipApiService.updateStatus(requestId, status);
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const handleOpenChat = async (request: MentorshipRequestData) => {
    try {
      const conv = await conversationService.createConversation(request.studentId._id);
      setChatState({
        conversationId: conv._id,
        otherUser: {
          _id: request.studentId._id,
          fullName: request.studentId.fullName,
          avatarUrl: request.studentId.avatarUrl,
          company: (request.studentId as any).department,
          position: 'Student',
        },
      });
    } catch (err) {
      console.error('Failed to open chat', err);
    }
  };

  if (chatState) {
    return <MentorshipChat conversationId={chatState.conversationId} otherUser={chatState.otherUser} onBack={() => setChatState(null)} />;
  }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;

  const acceptedRequests = mentorshipRequests.filter((r) => r.status === 'accepted');
  const pendingRequests = mentorshipRequests.filter((r) => r.status === 'pending');
  const upcomingEvents = events.filter((e) => new Date(e.eventDate) > new Date()).slice(0, 3);

  const quickStats = [
    { label: 'Jobs Posted', value: jobs.filter((j) => j.postedBy?.toString() === user?.id || (j.postedBy as any)?._id === user?.id).length, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Students Mentoring', value: acceptedRequests.length, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Pending Requests', value: pendingRequests.length, icon: Users, color: 'text-yellow-500' },
    { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.fullName}!</h1>
          <p className="text-gray-600">{user?.position} at {user?.company}</p>
        </div>
        <Button onClick={() => setIsJobModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Post Job</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card hover>
                <div className="flex items-center space-x-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pending Mentorship Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Mentorship Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request._id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {request.studentId?.avatarUrl && <img src={request.studentId.avatarUrl} alt={request.studentId.fullName} className="w-10 h-10 rounded-full object-cover" />}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{request.studentId?.fullName}</p>
                    <p className="text-sm text-gray-600">{request.studentId?.department}</p>
                    <p className="text-sm text-gray-700 italic mt-1">"{request.message}"</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdateStatus(request._id, 'accepted')} className="bg-green-600 hover:bg-green-700 text-white">Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(request._id, 'declined')} className="text-red-600 border-red-300">Decline</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Accepted Mentees */}
      {acceptedRequests.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Students You're Mentoring</h3>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {acceptedRequests.map((request) => (
              <div key={request._id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  {request.studentId?.avatarUrl && <img src={request.studentId.avatarUrl} alt={request.studentId.fullName} className="w-10 h-10 rounded-full object-cover" />}
                  <div>
                    <p className="font-semibold text-gray-900">{request.studentId?.fullName}</p>
                    <p className="text-sm text-gray-600">{request.studentId?.department}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleOpenChat(request)} className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event: any) => (
              <div key={event._id} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            ))}
            {upcomingEvents.length === 0 && <p className="text-gray-500 text-center py-4">No upcoming events</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
            <Heart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {posts.slice(0, 3).map((post: any) => (
              <div key={post._id} className="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{post.userId?.fullName || 'Unknown'}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{post.title}</p>
                  <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-gray-500 text-center py-4">No posts yet</p>}
          </div>
        </Card>
      </div>

      {/* Post Job Modal */}
      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="Post a Job">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Job Title / Role *</label><Input value={jobForm.role} onChange={(e) => setJobForm({ ...jobForm, role: e.target.value })} placeholder="e.g. Frontend Developer" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Company *</label><Input value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} placeholder="Company name" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Location *</label><Input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Remote, New York" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            <select value={jobForm.employmentType} onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label><Input value={jobForm.salaryRange} onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })} placeholder="e.g. $60k - $80k" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Apply Link</label><Input value={jobForm.applyLink} onChange={(e) => setJobForm({ ...jobForm, applyLink: e.target.value })} placeholder="https://careers.company.com/apply" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Job description..." className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" rows={3} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Requirements *</label><textarea value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} placeholder="Job requirements..." className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" rows={3} /></div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handlePostJob} className="flex-1">Post Job</Button>
            <Button onClick={() => setIsJobModalOpen(false)} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
