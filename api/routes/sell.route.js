import express from 'express';
import { createSellListing, getSellListings, getSellListingById } from '../controllers/sell.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.post('/', verifyToken, createSellListing);
router.get('/', getSellListings);
router.get('/:id', getSellListingById);

router.post('/upload', verifyToken, upload.array('images', 5), (req, res) => {
  try {
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ success: true, imageUrls });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;
