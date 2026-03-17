import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';

const router = express.Router();

/**
 * POST /api/payment
 * Handles pay-per-listing upgrade (R35).
 * In production this would integrate with a payment gateway (e.g. PayFast/Stripe).
 * For now it simply marks the user's limit as extended by recording the payment intent.
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    // TODO: Integrate real payment gateway here.
    // For now we simulate a successful payment so the UI can proceed.
    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      amount: amount || 35,
      userId,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ success: false, message: 'Payment processing failed' });
  }
});

export default router;
