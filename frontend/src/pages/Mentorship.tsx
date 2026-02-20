import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { MentorshipChat } from '../components/MentorshipChat';
import { Users, Send, Search, Filter, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import type { MentorshipChat as MentorshipChatType } from '../types';

export function Mentorship() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedChat, setSelectedChat] = useState<MentorshipChatType | null>(null);

  const alumni = storage.getUsers().filter(u => u.role === 'alumni');
  const myRequests = storage.getMentorshipRequests().filter(r => r.studentId === user?.id);

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = alumnus.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alumnus.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alumnus.position?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !departmentFilter || alumnus.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(alumni.map(a => a.department).filter(Boolean))) as string[];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const stats = [
    {
      label: 'Available Mentors',
      value: alumni.length,
      color: 'text-blue-600'
    },
    {
      label: 'Your Requests',
      value: myRequests.length,
      color: 'text-purple-600'
    },
    {
      label: 'Accepted',
      value: myRequests.filter(r => r.status === 'accepted').length,
      color: 'text-green-600'
    },
    {
      label: 'Pending',
      value: myRequests.filter(r => r.status === 'pending').length,
      color: 'text-yellow-600'
    }
  ];

  if (selectedChat) {
    return <MentorshipChat chat={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Program</h1>
        <p className="text-gray-600">Connect with experienced alumni for career guidance and support</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {myRequests.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mentorship Requests</h3>
          <div className="space-y-3">
            {myRequests.map((request) => {
              const alumnus = storage.getUserById(request.alumniId);
              const isAccepted = request.status === 'accepted';
              return (
                <div
                  key={request.id}
                  className="p-4 bg-gray-50 rounded-lg flex items-start justify-between"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    {alumnus?.avatarUrl && (
                      <img
                        src={alumnus.avatarUrl}
                        alt={alumnus.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900">{alumnus?.fullName}</p>
                        {getStatusIcon(request.status)}
                      </div>
                      <p className="text-sm text-gray-600">{alumnus?.position} at {alumnus?.company}</p>
                      <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Sent {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isAccepted && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const chat = storage.getOrCreateMentorshipChat(request.id, request.studentId, request.alumniId);
                          setSelectedChat(chat);
                        }}
                        className="flex items-center space-x-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                      </Button>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, company, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="sm:w-64 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlumni.map((alumnus, index) => {
            const hasRequested = myRequests.some(r => r.alumniId === alumnus.id);
            const request = myRequests.find(r => r.alumniId === alumnus.id);

            return (
              <motion.div
                key={alumnus.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {alumnus.avatarUrl && (
                        <img
                          src={alumnus.avatarUrl}
                          alt={alumnus.fullName}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">{alumnus.fullName}</h4>
                        <p className="text-sm text-gray-600">{alumnus.position}</p>
                        <p className="text-sm font-medium text-blue-600">{alumnus.company}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3 text-xs text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {alumnus.department}
                    </span>
                    <span>Class of {alumnus.graduationYear}</span>
                  </div>

                  {hasRequested ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request!.status
                        )}`}
                      >
                        {request!.status.charAt(0).toUpperCase() + request!.status.slice(1)}
                      </span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleRequestMentorship(alumnus.id)}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Request Mentorship</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No mentors found matching your criteria</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAlumni(null);
          setMessage('');
        }}
        title="Request Mentorship"
      >
        <div className="space-y-4">
          {selectedAlumni && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                You're requesting mentorship from{' '}
                <span className="font-semibold">
                  {alumni.find(a => a.id === selectedAlumni)?.fullName}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduce yourself and explain why you'd like to connect
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in learning more about your career path in software engineering. I'm currently studying Computer Science and would love to hear about your experiences..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be respectful and professional. Explain your goals and what you hope to learn.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedAlumni(null);
                setMessage('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!message.trim()}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Request</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
