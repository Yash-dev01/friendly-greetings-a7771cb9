// import { Card } from '../components/ui/Card';
// import { Briefcase, FileText, Mail, Bell } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { storage } from '../lib/storage';

// export function HomeDashboard() {
//   // ✅ Data (fallback included)
//   const jobs = storage.getJobs?.() || [
//     { id: '1', title: 'Frontend Developer Intern' },
//     { id: '2', title: 'Backend Developer (Node.js)' },
//   ];

//   const posts = storage.getPosts?.() || [
//     { id: '1', title: 'Welcome to the Community' },
//     { id: '2', title: 'Rules & Guidelines' },
//   ];

//   const newsletters = storage.getNewsletters?.() || [
//     { id: '1', title: 'Weekly Tech Update' },
//     { id: '2', title: 'Career Growth Newsletter' },
//   ];

//   const events = storage.getEvents?.() || [
//     { id: '1', title: 'React Workshop', date: '12 Dec 2025' },
//     { id: '2', title: 'Hackathon Registration', date: '18 Dec 2025' },
//   ];

//   return (
//     <div className="space-y-10">

//       {/* HEADER */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Home Dashboard
//         </h1>
//         <p className="text-gray-600">
//           Latest jobs, posts, newsletters and event notifications
//         </p>
//       </div>

//       <div className="flex flex-col xl:flex-row gap-6">

//         {/* LEFT: COLUMN DIVISION (JOBS / POSTS / NEWSLETTERS) */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">

//           {/* JOBS */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//             <Card hover className="p-6 rounded-2xl">
//               <div className="flex items-center gap-2 mb-4">
//                 <Briefcase className="text-blue-600 w-5 h-5" />
//                 <h2 className="text-lg font-semibold">Jobs</h2>
//               </div>

//               {jobs.length === 0 ? (
//                 <p className="text-sm text-gray-500">No jobs posted yet</p>
//               ) : (
//                 <ul className="space-y-2">
//                   {jobs.slice(0, 5).map((job: any) => (
//                     <li
//                       key={job.id}
//                       className="text-sm text-gray-700 border-l-2 pl-3 hover:border-blue-500 transition"
//                     >
//                       {job.title}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </Card>
//           </motion.div>

//           {/* POSTS */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//             <Card hover className="p-6 rounded-2xl">
//               <div className="flex items-center gap-2 mb-4">
//                 <FileText className="text-green-600 w-5 h-5" />
//                 <h2 className="text-lg font-semibold">Posts</h2>
//               </div>

//               {posts.length === 0 ? (
//                 <p className="text-sm text-gray-500">No posts available</p>
//               ) : (
//                 <ul className="space-y-2">
//                   {posts.slice(0, 5).map((post: any) => (
//                     <li
//                       key={post.id}
//                       className="text-sm text-gray-700 border-l-2 pl-3 hover:border-green-500 transition"
//                     >
//                       {post.title}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </Card>
//           </motion.div>

//           {/* NEWSLETTERS */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//             <Card hover className="p-6 rounded-2xl">
//               <div className="flex items-center gap-2 mb-4">
//                 <Mail className="text-purple-600 w-5 h-5" />
//                 <h2 className="text-lg font-semibold">Newsletters</h2>
//               </div>

//               {newsletters.length === 0 ? (
//                 <p className="text-sm text-gray-500">No newsletters yet</p>
//               ) : (
//                 <ul className="space-y-2">
//                   {newsletters.slice(0, 5).map((news: any) => (
//                     <li
//                       key={news.id}
//                       className="text-sm text-gray-700 border-l-2 pl-3 hover:border-purple-500 transition"
//                     >
//                       {news.title}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </Card>
//           </motion.div>

//         </div>

//         {/* RIGHT: NOTIFICATIONS (EVENTS ONLY) */}
//         <motion.div
//           initial={{ opacity: 0, x: 40 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="w-full xl:w-80"
//         >
//           <Card className="p-6 rounded-2xl">
//             <div className="flex items-center gap-2 mb-5">
//               <Bell className="text-orange-600 w-5 h-5" />
//               <h2 className="text-lg font-semibold">Latest Events</h2>
//             </div>

//             {events.length === 0 ? (
//               <p className="text-sm text-gray-500">No upcoming events</p>
//             ) : (
//               <div className="space-y-3">
//                 {events.map((event: any, index: number) => (
//                   <motion.div
//                     key={event.id}
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="rounded-xl border p-3 hover:bg-gray-50 transition"
//                   >
//                     <p className="font-medium text-sm text-gray-900">
//                       {event.title}
//                     </p>
//                     {event.date && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         {event.date}
//                       </p>
//                     )}
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </Card>
//         </motion.div>

//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Briefcase, FileText, Mail, Bell } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

// 🔹 Types (lightweight, enough for dashboard)
interface Job {
  _id: string;
  role: string;
  company: string;
}

interface Post {
  _id: string;
  title: string;
}

interface Event {
  _id: string;
  title: string;
  eventDate: string;
}

export function HomeDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getHomeDashboard();

        // API shape: { success, data }
        setJobs(res.data.jobs || []);
        setPosts(res.data.posts || []);
        setEvents(res.data.events || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <p className="text-gray-500 text-center mt-10">
        Loading dashboard...
      </p>
    );
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Home Dashboard
        </h1>
        <p className="text-gray-600">
          Latest jobs, posts, newsletters and event notifications
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">

        {/* LEFT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">

          {/* JOBS */}
          <Card hover className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="text-blue-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">Jobs</h2>
            </div>

            {jobs.length === 0 ? (
              <p className="text-sm text-gray-500">No jobs posted yet</p>
            ) : (
              <ul className="space-y-2">
                {jobs.map((job) => (
                  <li
                    key={job._id}
                    className="text-sm text-gray-700 border-l-2 pl-3"
                  >
                    <span className="font-medium">{job.role}</span> — {job.company}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* POSTS */}
          <Card hover className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-green-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">Posts</h2>
            </div>

            {posts.length === 0 ? (
              <p className="text-sm text-gray-500">No posts available</p>
            ) : (
              <ul className="space-y-2">
                {posts.map((post) => (
                  <li
                    key={post._id}
                    className="text-sm text-gray-700 border-l-2 pl-3"
                  >
                    {post.title}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* NEWSLETTERS */}
          <Card hover className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="text-purple-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">Newsletters</h2>
            </div>
            <p className="text-sm text-gray-500">Coming soon</p>
          </Card>

        </div>

        {/* RIGHT SECTION – EVENTS */}
        <Card className="p-6 rounded-2xl w-full xl:w-80">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="text-orange-600 w-5 h-5" />
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="border rounded-xl p-3 hover:bg-gray-50 transition"
                >
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.eventDate).toDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
