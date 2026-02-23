import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { storage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { MentorshipChat } from '../../components/MentorshipChat';
import { Briefcase, Newspaper, Image as ImageIcon, Calendar, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MentorshipChat as MentorshipChatType } from '../../types';

export function AlumniDashboard() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<MentorshipChatType | null>(null);
  const posts = storage.getPosts();
  const events = storage.getEvents();
  const jobs = storage.getJobs();
  const newsletters = storage.getNewsletters();
  const mentorshipRequests = storage.getMentorshipRequests().filter(r => r.alumniId === user?.id);
  const acceptedRequests = mentorshipRequests.filter(r => r.status === 'accepted');

  const myPosts = posts.filter(p => p.userId === user?.id);
  const upcomingEvents = events.filter(e => new Date(e.eventDate) > new Date()).slice(0, 3);

  if (selectedChat) {
    return <MentorshipChat chat={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  const quickStats = [
    { label: 'My Posts', value: myPosts.length, icon: Heart, color: 'text-red-500' },
    { label: 'Active Jobs', value: jobs.filter(j => j.isActive).length, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Students Mentoring', value: acceptedRequests.length, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'text-green-500' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-gray-600">
          {user?.position} at {user?.company}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
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

      {acceptedRequests.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Students You're Mentoring</h3>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {acceptedRequests.map((request) => {
              const student = storage.getUserById(request.studentId);
              const chat = storage.getMentorshipChatByRequestId(request.id);
              const unreadCount = chat ? chat.messages.filter(m => m.senderId !== user?.id).length : 0;
              return (
                <div
                  key={request.id}
                  className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {student?.avatarUrl && (
                      <img
                        src={student.avatarUrl}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{student?.fullName}</p>
                      <p className="text-sm text-gray-600">{student?.department}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const c = storage.getOrCreateMentorshipChat(request.id, request.studentId, request.alumniId);
                      setSelectedChat(c);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </Button>
                </div>
              );
            })}
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
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Community Posts</h3>
            <Heart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {posts.slice(0, 3).map(post => {
              const postUser = storage.getUserById(post.userId);
              return (
                <div key={post.id} className="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
                  {postUser?.avatarUrl && (
                    <img
                      src={postUser.avatarUrl}
                      alt={postUser.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{postUser?.fullName}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.title}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.likesCount} likes
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Latest Job Opportunities</h3>
          <Button size="sm" variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.filter(j => j.isActive).slice(0, 4).map(job => {
            const jobUser = storage.getUserById(job.postedBy);
            return (
              <div key={job.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{job.role}</h4>
                  <Briefcase className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">{job.company}</p>
                <p className="text-sm text-gray-600 mt-1">{job.location}</p>
                {job.salaryRange && (
                  <p className="text-sm text-green-600 mt-2">{job.salaryRange}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">Posted by {jobUser?.fullName}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
