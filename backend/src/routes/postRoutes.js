import express from 'express';
import { body } from 'express-validator';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);

router.post(
  '/',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    validate,
  ],
  createPost
);

router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post(
  '/:id/comments',
  protect,
  [body('content').notEmpty().withMessage('Comment content is required'), validate],
  addComment
);

export default router;
