import express from 'express';
import { generateListingDraft } from '../controllers/ai-listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// AI requests are authenticated to prevent anonymous use of the project's API budget.
router.post('/listing-draft', verifyToken, generateListingDraft);

export default router;
