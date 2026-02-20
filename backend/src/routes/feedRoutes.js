import express from 'express';
import { getFeed } from '../controllers/feedController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect,authorize('admin'), getFeed);

export default router;
