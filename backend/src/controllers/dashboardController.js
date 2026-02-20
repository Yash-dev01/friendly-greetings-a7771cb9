import Job from '../models/Job.js';
import Post from '../models/Post.js';
import Event from '../models/Event.js';

/**
 * GET /api/dashboard/home
 * Public / Protected (your choice)
 */
export const getHomeDashboardData = async (req, res) => {
  try {
    const [jobs, posts, events] = await Promise.all([
      // 🔹 Latest Jobs (5)
      Job.find({ isActive: true })
        .select('role company location createdAt')
        .sort({ createdAt: -1 })
        .limit(5),

      // 🔹 Latest Posts (5)
      Post.find()
        .select('title createdAt')
        .sort({ createdAt: -1 })
        .limit(5),

      // 🔹 Upcoming Events (5)
      Event.find({
        isActive: true,
        eventDate: { $gte: new Date() },
      })
        .select('title eventDate')
        .sort({ eventDate: 1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        posts,
        events,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
