import express from 'express';
import { sendOTP, verifyOTP, verifyFace, submitKyc } from '../controllers/verification.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/send-otp', verifyToken, sendOTP);
router.post('/verify-otp', verifyToken, verifyOTP);
router.post('/verify-face', verifyToken, verifyFace);
router.post('/submit-kyc', verifyToken, submitKyc);

export default router;
