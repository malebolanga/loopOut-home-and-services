import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import Listing from '../models/listing.model.js';

const router = express.Router();

/**
 * POST /api/promotion/payment
 * Handles listing promotion packages (Standard R40, Featured R100).
 */
import { generatePayfastData } from '../utils/payfast.js';

/**
 * POST /api/promotion/payment
 * Handles listing promotion packages (Standard R40, Featured R100).
 * Generates a PayFast redirect URL and fields.
 */
router.post('/payment', verifyToken, async (req, res) => {
  try {
    const { listingId, package: pkg, name, email } = req.body;

    if (!listingId || !['standard', 'premium'].includes(pkg)) {
      return res.status(400).json({ success: false, message: 'A listing and valid promotion package are required' });
    }

    const listing = await Listing.findOne({ _id: listingId, userRef: req.user.id });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found or not owned by this account' });
    }

    if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY || !process.env.APP_URL || !process.env.BACKEND_URL) {
      return res.status(503).json({ success: false, message: 'Secure promotion checkout is not configured yet' });
    }

    const amount = pkg === 'premium' ? '100.00' : '40.00';

    const payfast = generatePayfastData({
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount,
      item_name: `${pkg?.toUpperCase()} Promotion - Listing #${listingId}`,
      name_first: name || 'LoopOut',
      name_last: 'User',
      email_address: email || 'user@example.com',
      m_payment_id: `promo-${pkg}-${req.user.id}-${listingId}-${Date.now()}`,
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
