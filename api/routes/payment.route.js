import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';

const router = express.Router();

import { generatePayfastData } from '../utils/payfast.js';

/**
 * POST /api/payment
 * Handles pay-per-listing upgrade (R35).
 * Generates a PayFast redirect URL and fields.
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, amount, name, email } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    // Generate PayFast data
    const payfast = generatePayfastData({
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount: amount || '35.00',
      item_name: 'Standard Listing Upgrade',
      name_first: name || 'LoopOut',
      name_last: 'User',
      email_address: email || 'user@example.com',
      m_payment_id: `listing-up-${userId}-${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      message: 'PayFast session generated',
      payfast
    });
  } catch (error) {
    console.error('Payment generation error:', error);
    return res.status(500).json({ success: false, message: 'Could not initialize payment' });
  }
});

/**
 * POST /api/payment/itn
 * PayFast Instant Transaction Notification (Webhook).
 * PayFast calls this to confirm a payment was actually completed.
 */
router.post('/itn', async (req, res) => {
  try {
    const itnData = req.body;
    console.log('[PAYMENT ITN] Data received from PayFast:', itnData);
    
    // 1. Verify the signature (Production Requirement)
    // 2. Check payment status
    if (itnData.payment_status === 'COMPLETE') {
      // 3. Update listing limits in Database
      // Find the user by its userId embedded in m_payment_id (or as custom field)
      // For now we just log it as success.
      console.log(`[PAYMENT SUCCESS] Listing upgrade confirmed for payment ID: ${itnData.m_payment_id}`);
    }

    // PayFast expects a 200 OK after receiving ITN
    res.status(200).send('OK');
  } catch (error) {
    console.error('ITN Error:', error);
    res.status(500).send('Error');
  }
});

export default router;
