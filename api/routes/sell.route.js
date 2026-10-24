import express from 'express';
import { createSellListing, getSellListings, getSellListingById, updateSellListing, deleteSellListing, createGoodsOrder, getGoodsOrders, updateGoodsOrderStatus, getGoodsOrderConversation, reportGoodsOrderIssue } from '../controllers/sell.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../utils/upload.js';
import { requireOfferingType } from '../utils/requireOfferingType.js';

import multer from 'multer';

const router = express.Router();

router.post('/', verifyToken, requireOfferingType('goods'), createSellListing);
router.get('/orders', verifyToken, getGoodsOrders);
router.post('/orders', verifyToken, createGoodsOrder);
router.get('/orders/:orderId/conversation', verifyToken, getGoodsOrderConversation);
router.post('/orders/:orderId/issues', verifyToken, reportGoodsOrderIssue);
router.patch('/orders/:orderId/status', verifyToken, updateGoodsOrderStatus);
router.get('/', getSellListings);
router.get('/:id', getSellListingById);
router.put('/:id', verifyToken, requireOfferingType('goods'), updateSellListing);
router.delete('/:id', verifyToken, deleteSellListing);


router.post('/upload', verifyToken, requireOfferingType('goods'), (req, res) => {
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
