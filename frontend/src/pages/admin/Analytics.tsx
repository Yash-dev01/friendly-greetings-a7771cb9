import { useEffect, useState } from "react";
import { Card } from '../../components/ui/Card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TrendingUp, Users, Briefcase, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  analyticsService,
  UserAnalytics,
  EngagementAnalytics,
  EventAnalytics,
  JobAnalytics
} from '../../services/analyticsService';

interface TopPerformer {
  name: string;
  score: number;
}

export function Analytics() {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [jobAnalytics, setJobAnalytics] = useState<JobAnalytics | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [users, engagement, events, jobs] = await Promise.all([
          analyticsService.getUserAnalytics(),
          analyticsService.getEngagementAnalytics(),
          analyticsService.getEventAnalytics(),
          analyticsService.getJobAnalytics(),
        ]);

        setUserAnalytics(users);
        setEngagementAnalytics(engagement);
        setEventAnalytics(events);
        setJobAnalytics(jobs);

        // Map top activity users to names (you can fetch user info from another API if needed)
        const performers: TopPerformer[] = engagement.topActivityUsers.map(u => ({
          name: u._id, // Replace _id with actual user name if you fetch from /users/:id
          score: u.totalScore
        }));
        setTopPerformers(performers);

      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading || !userAnalytics || !engagementAnalytics || !eventAnalytics || !jobAnalytics) {
    return <p>Loading analytics...</p>;
  }

  // Prepare chart data
  const usersByRole = [
    { name: 'Alumni', value: userAnalytics.alumniCount, color: '#3b82f6' },
    { name: 'Students', value: userAnalytics.studentCount, color: '#10b981' },
    { name: 'Admins', value: userAnalytics.totalUsers - userAnalytics.alumniCount - userAnalytics.studentCount, color: '#8b5cf6' }
  ];

  const departmentData = userAnalytics.departmentStats.map(d => ({
    name: d._id || 'Unknown',
    count: d.count
  }));

  const yearData = userAnalytics.graduationStats
    .map(d => ({ year: d._id, count: d.count }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  const engagementMetrics = [
    { metric: 'Post Likes', value: engagementAnalytics.totalPosts },
    { metric: 'Event Attendees', value: eventAnalytics.totalEvents },
    { metric: 'Games Played', value: engagementAnalytics.topActivityUsers.length },
    { metric: 'Mentorship Requests', value: userAnalytics.mentors }
  ];

  const monthlyActivityData = [
    { month: 'Jan', posts: 0, jobs: 0, events: 0 },
    { month: 'Feb', posts: 0, jobs: 0, events: 0 },
    { month: 'Mar', posts: 0, jobs: 0, events: 0 },
    { month: 'Apr', posts: 0, jobs: 0, events: 0 },
    { month: 'May', posts: 0, jobs: 0, events: 0 },
    { month: 'Jun', posts: 0, jobs: 0, events: 0 },
    { month: 'Jul', posts: 0, jobs: 0, events: 0 },
    { month: 'Aug', posts: 0, jobs: 0, events: 0 },
    { month: 'Sep', posts: 0, jobs: 0, events: 0 },
    { month: 'Oct', posts: 0, jobs: 0, events: 0 },
    { month: 'Nov', posts: 0, jobs: 0, events: 0 },
    { month: 'Dec', posts: 0, jobs: 0, events: 0 }
  ];

  // Populate monthly activity counts from API (assuming backend provides monthly aggregation)
  // For now, we use placeholder values
  // You can replace this with real monthly aggregation from your backend

  const stats = [
    {
      label: 'Total Engagement',
      value: engagementAnalytics.totalPosts + jobAnalytics.totalJobs + eventAnalytics.totalEvents,
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+18%'
    },
    {
      label: 'Active Users',
      value: userAnalytics.totalUsers,
      icon: Users,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      label: 'Job Placements',
      value: jobAnalytics.activeJobs,
      icon: Briefcase,
      color: 'bg-purple-500',
      change: '+25%'
    },
    {
      label: 'Events This Year',
      value: eventAnalytics.upcoming + eventAnalytics.completed,
      icon: Calendar,
      color: 'bg-orange-500',
      change: '+8%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
        <p className="text-gray-600">Deep insights into platform performance and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change} vs last period</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersByRole}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Graduation Year Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yearData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={engagementMetrics} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="metric" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <span>Top Game Performers</span>
        </h3>
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-amber-600 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <span className="font-semibold text-gray-900">{performer.name}</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{performer.score} pts</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
