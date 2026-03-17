import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * POST /api/promotion/payment
 * Handles listing promotion packages (Standard R40, Featured R100).
 * In production this would integrate with a payment gateway.
 * For now it simulates a successful payment and navigates the user forward.
 */
router.post('/payment', verifyToken, async (req, res) => {
  try {
    const { userId, listingId, package: pkg, paymentMethod, amount } = req.body;

    if (!userId || !listingId) {
      return res.status(400).json({ success: false, message: 'userId and listingId are required' });
    }

    // TODO: Integrate real payment gateway here (e.g. PayFast/Stripe).
    // For now simulate a successful payment.
    return res.status(200).json({
      success: true,
      message: `Promotion payment of R${amount} for ${pkg} package processed successfully`,
      listingId,
      package: pkg,
      paymentMethod,
    });
  } catch (error) {
    console.error('Promotion payment error:', error);
    return res.status(500).json({ success: false, message: 'Promotion payment processing failed' });
  }
});

export default router;
