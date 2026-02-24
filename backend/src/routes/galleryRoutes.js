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
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItemById);

router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('media'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    validate,
  ],
  createGalleryItem
);

router.put('/:id', protect, authorize('admin'), updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

export default router;
