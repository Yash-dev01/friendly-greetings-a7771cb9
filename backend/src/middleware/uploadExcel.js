import multer from 'multer';
import path from 'path';

// store in memory (we parse buffer). Good for small/medium files.
// For very large files consider diskStorage with streaming.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx, .xls and .csv files are allowed'), false);
  }
};

export const uploadExcel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});
