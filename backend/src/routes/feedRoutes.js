import express from 'express';
import { getFeed } from '../controllers/feedController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Feed is accessible by all authenticated users
router.get('/', getFeed);

export default router;
