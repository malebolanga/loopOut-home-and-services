import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.post('/', verifyToken, upload.array('files', 10), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: 'At least one file is required.' });
  }
  return res.status(201).json({
    success: true,
    urls: req.files.map((file) => `/uploads/${file.filename}`),
  });
});

export default router;
