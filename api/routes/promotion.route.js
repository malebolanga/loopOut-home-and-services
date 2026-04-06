import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

/**
 * POST /api/promotion/payment
 * Handles listing promotion packages (Standard R40, Featured R100).
 * In production this would integrate with a payment gateway.
 * For now it simulates a successful payment and navigates the user forward.
 */
import { generatePayfastData } from '../utils/payfast.js';

/**
 * POST /api/promotion/payment
 * Handles listing promotion packages (Standard R40, Featured R100).
 * Generates a PayFast redirect URL and fields.
 */
router.post('/payment', verifyToken, async (req, res) => {
  try {
    const { userId, listingId, package: pkg, name, email, amount } = req.body;

    if (!userId || !listingId) {
      return res.status(400).json({ success: false, message: 'userId and listingId are required' });
    }

    // Generate PayFast data for either R40 (Standard) or R100 (Premium)
    const payfast = generatePayfastData({
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount: amount || (pkg === 'premium' ? '100.00' : '40.00'),
      item_name: `${pkg?.toUpperCase()} Promotion - Listing #${listingId}`,
      name_first: name || 'LoopOut',
      name_last: 'User',
      email_address: email || 'user@example.com',
      m_payment_id: `promo-pkg-${listingId}-${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Promotion payment session generated',
      payfast
    });
  } catch (error) {
    console.error('Promotion payment generation error:', error);
    return res.status(500).json({ success: false, message: 'Could not initialize promotion payment' });
  }
});

export default router;
