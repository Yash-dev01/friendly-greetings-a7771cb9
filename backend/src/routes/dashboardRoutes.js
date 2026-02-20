import express from 'express';
import { getHomeDashboardData } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Optional protect
router.get('/home', protect, getHomeDashboardData);

export default router;
