import express from 'express';
import { sendOTP, verifyOTP, verifyFace, submitKyc, getVerificationStatus, getPendingKycReviews, reviewKyc, getDriverVerificationStatus, submitDriverVerification, getPendingDriverReviews, reviewDriverVerification } from '../controllers/verification.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { requireLoopOutAdmin } from '../utils/requireLoopOutAdmin.js';

const router = express.Router();

router.get('/status', verifyToken, getVerificationStatus);
router.get('/driver-status', verifyToken, getDriverVerificationStatus);
router.post('/driver-submit', verifyToken, submitDriverVerification);
router.get('/admin/pending', verifyToken, requireLoopOutAdmin, getPendingKycReviews);
router.post('/admin/:userId/review', verifyToken, requireLoopOutAdmin, reviewKyc);
router.get('/admin/driver-pending', verifyToken, requireLoopOutAdmin, getPendingDriverReviews);
router.post('/admin/driver/:userId/review', verifyToken, requireLoopOutAdmin, reviewDriverVerification);
router.post('/send-otp', verifyToken, sendOTP);
router.post('/verify-otp', verifyToken, verifyOTP);
router.post('/verify-face', verifyToken, verifyFace);
router.post('/submit-kyc', verifyToken, submitKyc);

export default router;
