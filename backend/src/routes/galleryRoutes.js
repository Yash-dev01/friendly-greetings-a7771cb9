import express from 'express';
import { body } from 'express-validator';
import {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItemById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('mediaUrl').notEmpty().withMessage('Media URL is required'),
    body('mediaType').isIn(['photo', 'video']).withMessage('Media type must be photo or video'),
    validate,
  ],
  createGalleryItem
);

router.put('/:id', protect, authorize('admin'), updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

export default router;
