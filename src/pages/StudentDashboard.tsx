import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, Star, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { mentorshipApiService, MentorshipRequestData } from '../services/mentorshipApiService';
import { conversationService } from '../services/conversationService';
import { socketService } from '../services/socketService';
import { jobService, Job } from '../services/jobService';
import { apiService } from '../services/api';
import { authService } from '../services/authService';
import { MentorshipChat } from '../components/MentorshipChat';

export function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequestData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [chatState, setChatState] = useState<{
    conversationId: string;
    otherUser: { _id: string; fullName: string; avatarUrl?: string; company?: string; position?: string };
  } | null>(null);

  useEffect(() => {
    if (user?.id) socketService.connect(user.id);
    fetchData();
    return () => { socketService.disconnect(); };
  }, [user]);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const [alumniRes, jobsRes, requestsData] = await Promise.all([
        apiService.get<{ success: boolean; data: any[] }>('/users?role=alumni', token || undefined),
        jobService.getJobs(),
        mentorshipApiService.getRequests(),
      ]);
      setAlumni((alumniRes as any).data || []);
      const jobList = Array.isArray(jobsRes) ? jobsRes : (jobsRes as any).data || [];
      setJobs(jobList.filter((j: Job) => j.isActive !== false));
      setMyRequests(requestsData);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = (alum: any) => {
    setSelectedAlumni(alum);
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!message.trim() || !selectedAlumni || !user) return;
    try {
      await mentorshipApiService.createRequest(selectedAlumni._id, message.trim());
      setMessage('');
      setIsModalOpen(false);
      setSelectedAlumni(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleOpenChat = async (request: MentorshipRequestData) => {
    try {
      const conv = await conversationService.createConversation(request.alumniId._id);
      setChatState({
        conversationId: conv._id,
        otherUser: {
          _id: request.alumniId._id,
          fullName: request.alumniId.fullName,
          avatarUrl: request.alumniId.avatarUrl,
          company: request.alumniId.company,
          position: request.alumniId.position,
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

  const stats = [
    { label: 'Alumni Network', value: alumni.length, icon: Users, color: 'text-blue-500' },
    { label: 'Job Openings', value: jobs.length, icon: Briefcase, color: 'text-green-500' },
    { label: 'Mentorship Requests', value: myRequests.length, icon: Star, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.fullName}!</h1>
        <p className="text-gray-600">{user?.department} • Class of {user?.graduationYear}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
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

      {/* Alumni Mentors */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect with Alumni Mentors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alumni.slice(0, 6).map((alum: any) => {
            const hasRequested = myRequests.some((r) => r.alumniId._id === alum._id);
            return (
              <div key={alum._id} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {alum.avatarUrl && <img src={alum.avatarUrl} alt={alum.fullName} className="w-12 h-12 rounded-full object-cover" />}
                  <div>
                    <h4 className="font-semibold text-gray-900">{alum.fullName}</h4>
                    <p className="text-sm text-gray-600">{alum.position}</p>
                    <p className="text-sm text-gray-600">{alum.company}</p>
                    <p className="text-xs text-gray-500 mt-1">Class of {alum.graduationYear}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleRequestMentorship(alum)} disabled={hasRequested}>
                  {hasRequested ? 'Requested' : 'Connect'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Jobs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Job Opportunities</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 4).map((job: any) => (
            <div key={job._id} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">{job.role}</h4>
              <p className="text-sm text-gray-600 mt-1">{job.company}</p>
              <p className="text-sm text-gray-600">{job.location}</p>
              {job.salaryRange && <p className="text-sm text-green-600 mt-2">{job.salaryRange}</p>}
              {job.applyLink && (
                <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="w-full mt-3">Apply Now</Button>
                </a>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* My Requests */}
      {myRequests.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mentorship Requests</h3>
          <div className="space-y-3">
            {myRequests.map((request) => (
              <div key={request._id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {request.alumniId?.avatarUrl && <img src={request.alumniId.avatarUrl} alt={request.alumniId.fullName} className="w-10 h-10 rounded-full object-cover" />}
                  <div>
                    <p className="font-semibold text-gray-900">{request.alumniId?.fullName}</p>
                    <p className="text-sm text-gray-600">{request.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {request.status === 'accepted' && (
                    <Button size="sm" onClick={() => handleOpenChat(request)}>
                      <MessageSquare className="w-4 h-4 mr-1" />Chat
                    </Button>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'accepted' ? 'bg-green-100 text-green-700'
                    : request.status === 'declined' ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Mentorship">
        <div className="space-y-4">
          <p className="text-gray-700">Send a message to introduce yourself.</p>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, I'm interested in learning more about your career path..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]" />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitRequest} disabled={!message.trim()} className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Send Request</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
