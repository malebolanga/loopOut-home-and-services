import express from 'express';
import {
  createReview,
  getListingReviews,
  deleteReview,
  markHelpful
} from '../controllers/review.controller.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/:entityId', verifyUser, createReview);
router.get('/:type/:entityId', getListingReviews); // type can be listing, service, etc.
router.delete('/:reviewId', verifyUser, deleteReview);
router.patch('/helpful/:reviewId', verifyUser, markHelpful);

export default router;
