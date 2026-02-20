// controllers/analytics/userAnalytics.js
import User from "../models/User.js";
import MentorshipRequest from "../models/MentorshipRequest.js";
import Job from "../models/Job.js";
import Post from "../models/Post.js";
import GameScore from "../models/GameScore.js";
import Event from "../models/Event.js";

export const getUserAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const alumniCount = await User.countDocuments({ role: "alumni" });
    const studentCount = await User.countDocuments({ role: "student" });
    const mentors = await MentorshipRequest.countDocuments({ status: "active" });

    const departmentStats = await User.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const graduationStats = await User.aggregate([
      { $group: { _id: "$graduationYear", count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      alumniCount,
      studentCount,
      mentors,
      departmentStats,
      graduationStats
    });
  } catch (err) {
    res.status(500).json({ message: "User analytics failed", error: err.message });
  }
};
// controllers/analytics/engagementAnalytics.js

export const getEngagementAnalytics = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(5);

    const topActivityUsers = await GameScore.aggregate([
      { $group: { _id: "$userId", totalScore: { $sum: "$score" } } },
      { $sort: { totalScore: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalPosts,
      recentPosts,
      topActivityUsers
    });

  } catch (err) {
    res.status(500).json({ message: "Engagement analytics failed", error: err.message });
  }
};
// controllers/analytics/eventAnalytics.js

export const getEventAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcoming = await Event.countDocuments({ status: "upcoming" });
    const completed = await Event.countDocuments({ status: "completed" });
    const cancelled = await Event.countDocuments({ status: "cancelled" });

    const monthlyStats = await Event.aggregate([
      {
        $group: {
          _id: { $month: "$eventDate" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalEvents,
      upcoming,
      completed,
      cancelled,
      monthlyStats
    });

  } catch (err) {
    res.status(500).json({ message: "Event analytics failed", error: err.message });
  }
};
// controllers/analytics/jobAnalytics.js

export const getJobAnalytics = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });

    const jobsPerMonth = await Job.aggregate([
      {
        $group: {
          _id: { $month: "$postedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalJobs,
      activeJobs,
      jobsPerMonth
    });

  } catch (err) {
    res.status(500).json({ message: "Job analytics failed", error: err.message });
  }
};
