import express from 'express';
import { getFeaturedItems, getTrendingItems, getNearbyItems } from '../controllers/explore.controller.js';

const router = express.Router();

router.get('/featured', getFeaturedItems);
router.get('/trending', getTrendingItems);
router.get('/nearby', getNearbyItems);

export default router;
