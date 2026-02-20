import express from 'express';
import { body } from 'express-validator';
import {
  getConversations,
  getConversationById,
  createConversation,
  sendMessage,
  markAsRead,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', protect, getConversations);
router.get('/:id', protect, getConversationById);

router.post(
  '/',
  protect,
  [body('otherUserId').notEmpty().withMessage('Other user ID is required'), validate],
  createConversation
);

router.post(
  '/:id/messages',
  protect,
  [body('content').notEmpty().withMessage('Message content is required'), validate],
  sendMessage
);

router.put('/:id/read', protect, markAsRead);

export default router;
