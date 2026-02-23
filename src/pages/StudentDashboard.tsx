import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
// Input removed - unused
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export function StudentDashboard() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const alumni = storage.getUsers().filter(u => u.role === 'alumni');
  const jobs = storage.getJobs().filter(j => j.isActive).slice(0, 4);
  const myRequests = storage.getMentorshipRequests().filter(r => r.studentId === user?.id);

  const handleRequestMentorship = (alumniId: string) => {
    setSelectedAlumni(alumniId);
    setIsModalOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!message.trim() || !selectedAlumni || !user) return;

    storage.addMentorshipRequest({
      id: Date.now().toString(),
      studentId: user.id,
      alumniId: selectedAlumni,
      status: 'pending',
      message: message.trim(),
      createdAt: new Date().toISOString()
    });

    setMessage('');
    setIsModalOpen(false);
    setSelectedAlumni(null);
  };

  const stats = [
    { label: 'Alumni Network', value: alumni.length, icon: Users, color: 'text-blue-500' },
    { label: 'Job Openings', value: jobs.length, icon: Briefcase, color: 'text-green-500' },
    { label: 'Mentorship Requests', value: myRequests.length, icon: Star, color: 'text-purple-500' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.fullName}!
        </h1>
        <p className="text-gray-600">
          {user?.department} • Class of {user?.graduationYear}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
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

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect with Alumni Mentors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alumni.slice(0, 6).map(alumnus => {
            const hasRequested = myRequests.some(r => r.alumniId === alumnus.id);
            return (
              <div key={alumnus.id} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {alumnus.avatarUrl && (
                    <img
                      src={alumnus.avatarUrl}
                      alt={alumnus.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{alumnus.fullName}</h4>
                    <p className="text-sm text-gray-600">{alumnus.position}</p>
                    <p className="text-sm text-gray-600">{alumnus.company}</p>
                    <p className="text-xs text-gray-500 mt-1">Class of {alumnus.graduationYear}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleRequestMentorship(alumnus.id)}
                  disabled={hasRequested}
                >
                  {hasRequested ? 'Requested' : 'Connect'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Job Opportunities for You</h3>
          <Button size="sm" variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">{job.role}</h4>
              <p className="text-sm text-gray-600 mt-1">{job.company}</p>
              <p className="text-sm text-gray-600">{job.location}</p>
              {job.salaryRange && (
                <p className="text-sm text-green-600 mt-2">{job.salaryRange}</p>
              )}
              <Button size="sm" className="w-full mt-3">Apply Now</Button>
            </div>
          ))}
        </div>
      </Card>

      {myRequests.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mentorship Requests</h3>
          <div className="space-y-3">
            {myRequests.map(request => {
              const alumnus = storage.getUserById(request.alumniId);
              return (
                <div key={request.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {alumnus?.avatarUrl && (
                      <img
                        src={alumnus.avatarUrl}
                        alt={alumnus.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{alumnus?.fullName}</p>
                      <p className="text-sm text-gray-600">{request.message}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : request.status === 'declined'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Mentorship">
        <div className="space-y-4">
          <p className="text-gray-700">
            Send a message to introduce yourself and explain why you'd like to connect.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi, I'm interested in learning more about your career path..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]"
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
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
