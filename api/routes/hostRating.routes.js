import express from 'express';
import {
    rateHost,
    getHostRatings,
    getUserHostRating
} from '../controllers/hostRating.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Rate a host
router.post('/rate', verifyToken, rateHost);

// Get host ratings
router.get('/ratings/:hostId', getHostRatings);

// Get user's specific rating for a host
router.get('/user-rating/:hostId', verifyToken, getUserHostRating);

export default router;