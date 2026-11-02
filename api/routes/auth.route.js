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
  resetPassword,
  verifyTwoFactorLogin,
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  confirmTwoFactorDisable
} from '../controllers/auth.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post('/verify-two-factor-login', verifyTwoFactorLogin);
router.post('/two-factor/enable', verifyToken, beginTwoFactorSetup);
router.post('/two-factor/confirm', verifyToken, confirmTwoFactorSetup);
router.post('/two-factor/disable', verifyToken, disableTwoFactor);
router.post('/two-factor/disable/confirm', verifyToken, confirmTwoFactorDisable);
router.post('/google', google);
router.get('/signout', signOut);
router.post('/validate-token', validateToken);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
