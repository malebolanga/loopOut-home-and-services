import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../utils/verifyUser.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';
import Escrow from '../models/escrow.model.js';
import Booking from '../models/Booking.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import Withdrawal from '../models/withdrawal.model.js';
import { generatePayfastData } from '../utils/payfast.js';

const router = express.Router();

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
 * POST /api/payment/escrow
 * Handles Escrow Secure Checkout.
 */
router.post('/escrow', verifyToken, async (req, res) => {
  try {
    const { userId, amount, name, email, serviceId, providerName } = req.body;

    let dbItemPrice = null;
    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
      const dbItem = (await Listing.findById(serviceId)) || 
                     (await Helper.findById(serviceId)) || 
                     (await Service.findById(serviceId)) || 
                     (await Event.findById(serviceId));
      if (dbItem) {
        dbItemPrice = dbItem.regularPrice || dbItem.price;
      }
    }

    const safeAmount = dbItemPrice 
      ? Number(dbItemPrice).toFixed(2) 
      : (amount ? Number(amount).toFixed(2) : '35.00');
    
    const safeItemName = `Secure Escrow: ${providerName}`.substring(0, 99);
    
    const payfast = generatePayfastData({
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount: safeAmount,
      item_name: safeItemName,
      name_first: name || 'LoopOut',
      name_last: 'Client',
      email_address: email || 'user@example.com',
      m_payment_id: `escrow-${serviceId}-${userId}-${Date.now()}`.substring(0, 99),
    });

    return res.status(200).json({
      success: true,
      message: 'Escrow Secure Checkout initialized',
      payfast
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not initialize escrow payment' });
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
    
    // 1. Verify the signature (Production Requirement - Should be implemented for launch)
    // 2. Check payment status
    if (itnData.payment_status === 'COMPLETE') {
      const paymentId = itnData.m_payment_id;
      
      if (paymentId.startsWith('escrow-')) {
        const parts = paymentId.split('-');
        // escrow-{serviceId}-{userId}-{timestamp}
        const serviceId = parts[1];
        const clientId = parts[2];
        const amount = itnData.amount_gross;

        console.log(`[ESCROW SUCCESS] Funds received for Service: ${serviceId}, Client: ${clientId}, Amount: ${amount}`);

        // Find existing booking or create one
        let booking = await Booking.findOne({ 
          $or: [{ listing: serviceId }, { helper: serviceId }, { service: serviceId }],
          user: clientId,
          status: 'pending'
        }).sort({ createdAt: -1 });

        if (booking) {
          booking.status = 'confirmed';
          await booking.save();
        }

        // Record in Escrow model
        const newEscrow = new Escrow({
          bookingId: booking ? booking._id : new mongoose.Types.ObjectId(),
          clientId,
          providerId: itnData.custom_str1 || (booking ? (booking.listing?.userRef || booking.helper?.userRef || booking.service?.userRef) : undefined),
          amount: Number(amount),
          status: 'held',
          paymentId: itnData.pf_payment_id,
          mPaymentId: paymentId
        });

        await newEscrow.save();
        
        // Notify both parties
        // (Implementation for professional notification could go here)
      } else if (paymentId.startsWith('listing-up-')) {
        console.log(`[PAYMENT SUCCESS] Listing upgrade confirmed for payment ID: ${paymentId}`);
        // Handle listing upgrade logic
      }
    }

    // PayFast expects a 200 OK after receiving ITN
    res.status(200).send('OK');
  } catch (error) {
    console.error('ITN Error:', error);
    res.status(500).send('Error');
  }
});

/**
 * POST /api/payment/withdrawal
 * Initiates a host fund extraction request.
 */
router.post('/withdrawal', verifyToken, async (req, res) => {
  try {
    const { userId, amount, accountDetails } = req.body;

    if (!userId || !amount || !accountDetails) {
      return res.status(400).json({ success: false, message: 'All biological and financial parameters are required.' });
    }

    const newWithdrawal = new Withdrawal({
      userId,
      amount,
      accountDetails,
      status: 'pending'
    });

    await newWithdrawal.save();

    res.status(200).json({
      success: true,
      message: 'Neural Extraction Sequence Initiated. Verification in progress.',
      withdrawal: newWithdrawal
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Neural extraction engine failed.' });
  }
});

export default router;
