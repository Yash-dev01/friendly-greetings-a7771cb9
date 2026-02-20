import express from 'express';
import { body } from 'express-validator';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJobById);

router.post(
  '/',
  protect,
  authorize('alumni', 'admin'),
  [
    body('company').notEmpty().withMessage('Company name is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('requirements').notEmpty().withMessage('Requirements are required'),
    validate,
  ],
  createJob
);

router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', protect, authorize('student'), applyToJob);

export default router;
