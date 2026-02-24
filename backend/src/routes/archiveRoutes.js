import express from 'express';
import { body } from 'express-validator';
import {
  getAllArchives,
  getArchiveById,
  createArchive,
  updateArchive,
  deleteArchive,
} from '../controllers/archiveController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllArchives);
router.get('/:id', getArchiveById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('year').isNumeric().withMessage('Year must be a number'),
    body('category').isIn(['Awards', 'Research', 'Infrastructure', 'Other']).withMessage('Invalid category'),
    validate,
  ],
  createArchive
);

router.put('/:id', protect, authorize('admin'), updateArchive);
router.delete('/:id', protect, authorize('admin'), deleteArchive);

export default router;
