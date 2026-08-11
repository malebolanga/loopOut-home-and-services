import express from 'express';
import { 
  google, 
  signOut, 
  signin, 
  signup,
  validateToken,
  verifyOtp,
  resendOtp,
  requestPasswordReset,
  resetPassword
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post('/google', google);
router.get('/signout', signOut);
router.post('/validate-token', validateToken);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
