import { Users, Calendar, Briefcase, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { storage } from '../../lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const users = storage.getUsers();
  const events = storage.getEvents();
  const jobs = storage.getJobs();
  const posts = storage.getPosts();

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%'
    },
    {
      title: 'Active Events',
      value: events.length,
      icon: Calendar,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      change: '+8%'
    },
    {
      title: 'Job Posts',
      value: jobs.filter(j => j.isActive).length,
      icon: Briefcase,
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-50',
      change: '+15%'
    },
    {
      title: 'Engagement',
      value: posts.length,
      icon: TrendingUp,
      color: 'from-rose-400 to-rose-600',
      bgColor: 'bg-rose-50',
      change: '+23%'
    }
  ];

  const userRoleData = [
    { name: 'Alumni', count: users.filter(u => u.role === 'alumni').length },
    { name: 'Students', count: users.filter(u => u.role === 'student').length },
    { name: 'Admins', count: users.filter(u => u.role === 'admin').length }
  ];

  const engagementData = [
    { month: 'Jan', posts: 12, jobs: 5 },
    { month: 'Feb', posts: 15, jobs: 8 },
    { month: 'Mar', posts: 18, jobs: 12 },
    { month: 'Apr', posts: 22, jobs: 15 },
    { month: 'May', posts: 28, jobs: 18 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className={`relative ${stat.bgColor} rounded-full w-52 h-52 flex flex-col items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
                  <div className={`absolute -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                    <div className="inline-block px-3 py-1 bg-white rounded-full">
                      <p className="text-xs font-semibold text-green-600">{stat.change}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 backdrop-blur-xl rounded-2xl" />
            <Card className="relative bg-white/40 backdrop-blur-sm border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userRoleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 backdrop-blur-xl rounded-2xl" />
            <Card className="relative bg-white/40 backdrop-blur-sm border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="posts"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-xl rounded-2xl" />
          <Card className="relative bg-white/40 backdrop-blur-sm border border-white/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {posts.slice(0, 5).map((post, idx) => {
                const user = users.find(u => u.id === post.userId);
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="flex items-start space-x-3 pb-4 border-b border-gray-200/50 last:border-0"
                  >
                    {user?.avatarUrl && (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
