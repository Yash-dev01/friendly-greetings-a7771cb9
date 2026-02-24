import express from 'express';
import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
  uploadResume
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateProfile);

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/resume', protect, upload.single('resume'), uploadResume);

export default router;