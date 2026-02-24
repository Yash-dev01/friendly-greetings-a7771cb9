import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDir = 'uploads';
const dirs = ['avatars', 'resumes', 'gallery'];
dirs.forEach((dir) => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/gallery';
    if (file.fieldname === 'avatar') folder = 'uploads/avatars';
    if (file.fieldname === 'resume') folder = 'uploads/resumes';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|webm|mov/;
  const docTypes = /pdf|doc|docx/;

  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (imageTypes.test(ext) || videoTypes.test(ext) || docTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
