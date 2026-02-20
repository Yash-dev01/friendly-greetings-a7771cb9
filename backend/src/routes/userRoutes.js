import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadExcel} from '../middleware/uploadExcel.js'
import {bulkUploadUsers} from '../controllers/userController.js'
const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.post(  '/upload-excel',  protect,  authorize('admin'),  uploadExcel.single('file'),  bulkUploadUsers);

export default router;