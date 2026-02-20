// routes/analyticsRoutes.js
import express from "express";

import {
  getJobAnalytics,
  getEventAnalytics,
  getEngagementAnalytics,
  getUserAnalytics,
} from "../controllers/analyticsController.js";
const router = express.Router();

router.get("/users", getUserAnalytics);
router.get("/engagement", getEngagementAnalytics);
router.get("/events", getEventAnalytics);
router.get("/jobs", getJobAnalytics);

export default router;
