import express from 'express';
import multer from 'multer';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.post('/', verifyToken, (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File size exceeds the 25MB limit.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ success: false, message: 'Too many files uploaded (maximum 10).' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ success: false, message: 'Unexpected file field. Please upload using the "files" field.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(err.statusCode || 400).json({ success: false, message: err.message || 'File upload failed.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one file is required.' });
    }

    return res.status(201).json({
      success: true,
      urls: req.files.map((file) => `/uploads/${file.filename}`),
    });
  });
});

export default router;

