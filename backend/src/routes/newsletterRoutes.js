import express from 'express';
import { body } from 'express-validator';
import {
  getAllNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  publishNewsletter,
  unpublishNewsletter,
} from '../controllers/newsletterController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllNewsletters);
router.get('/:id', getNewsletterById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    validate,
  ],
  createNewsletter
);

router.put('/:id', protect, authorize('admin'), updateNewsletter);
router.delete('/:id', protect, authorize('admin'), deleteNewsletter);
router.put('/:id/publish', protect, authorize('admin'), publishNewsletter);
router.put('/:id/unpublish', protect, authorize('admin'), unpublishNewsletter);

export default router;
