import express from 'express';
import { createSellListing, getSellListings, getSellListingById } from '../controllers/sell.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../utils/upload.js';

import multer from 'multer';

const router = express.Router();

router.post('/', verifyToken, createSellListing);
router.get('/', getSellListings);
router.get('/:id', getSellListingById);

router.post('/upload', verifyToken, (req, res) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(err.statusCode || 400).json({ success: false, message: err.message || 'Upload failed' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ success: true, imageUrls });
  });
});

export default router;
