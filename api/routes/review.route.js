import express from 'express';
import {
  createReview,
  getListingReviews,
  deleteReview,
  markHelpful
} from '../controllers/review.controller.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/:listingId', verifyUser, createReview);
router.get('/listing/:listingId', getListingReviews);
router.delete('/:reviewId', verifyUser, deleteReview);
router.patch('/helpful/:reviewId', verifyUser, markHelpful);

export default router;
