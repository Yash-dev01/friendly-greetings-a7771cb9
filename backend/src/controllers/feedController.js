import Job from '../models/Job.js';
import Post from '../models/Post.js';
import Event from '../models/Event.js';

export const getFeed = async (req, res) => {
  try {
    const { type = 'all', limit = 20 } = req.query;

    const feed = [];

    if (type === 'all' || type === 'posts') {
      const posts = await Post.find()
        .populate('userId', 'fullName avatarUrl company position')
        .sort({ createdAt: -1 })
        .limit(limit);

      feed.push(
        ...posts.map(p => ({
          _id: p._id,
          type: 'post',
          title: p.title,
          content: p.content,
          imageUrl: p.imageUrl,
          createdAt: p.createdAt,
          user: p.userId,
          likeCount: p.likes.length,
          commentCount: p.comments.length,
        }))
      );
    }

    if (type === 'all' || type === 'jobs') {
      const jobs = await Job.find({ isActive: true })
        .populate('postedBy', 'fullName avatarUrl company position')
        .sort({ createdAt: -1 })
        .limit(limit);

      feed.push(
        ...jobs.map(j => ({
          _id: j._id,
          type: 'job',
          title: j.role,
          content: j.description,
          company: j.company,
          location: j.location,
          salaryRange: j.salaryRange,
          createdAt: j.createdAt,
          user: j.postedBy,
        }))
      );
    }

    if (type === 'all' || type === 'events') {
      const events = await Event.find({ isActive: true })
        .populate('createdBy', 'fullName avatarUrl company position')
        .sort({ eventDate: -1 })
        .limit(limit);

      feed.push(
        ...events.map(e => ({
          _id: e._id,
          type: 'event',
          title: e.title,
          content: e.description,
          location: e.location,
          imageUrl: e.imageUrl,
          createdAt: e.eventDate,
          user: e.createdBy,
          likeCount: e.attendees.length,
        }))
      );
    }

    // Sort mixed feed
    feed.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, data: feed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
