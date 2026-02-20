import express from 'express';
import { body } from 'express-validator';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest,
} from '../controllers/mentorshipController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', protect, getAllRequests);
router.get('/:id', protect, getRequestById);

router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('alumniId').notEmpty().withMessage('Alumni ID is required'),
    body('message').notEmpty().withMessage('Message is required'),
    validate,
  ],
  createRequest
);

router.put(
  '/:id/status',
  protect,
  authorize('alumni'),
  [body('status').isIn(['accepted', 'declined']).withMessage('Invalid status'), validate],
  updateRequestStatus
);

router.delete('/:id', protect, authorize('student'), deleteRequest);

export default router;
