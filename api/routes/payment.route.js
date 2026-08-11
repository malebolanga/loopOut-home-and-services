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
import PaymentIntent from '../models/paymentIntent.model.js';
import { generatePayfastData, isValidPayfastItn } from '../utils/payfast.js';

const router = express.Router();

/**
 * POST /api/payment
 * Handles pay-per-listing upgrade (R35).
 * Generates a PayFast redirect URL and fields.
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY || !process.env.APP_URL || !process.env.BACKEND_URL) {
      return res.status(503).json({ success: false, message: 'Secure checkout is not configured yet' });
    }

    // Generate PayFast data
    const payfast = generatePayfastData({
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount: '35.00',
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
    const { name, email, serviceId } = req.body;
    const userId = req.user.id;
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ success: false, message: 'A valid item is required.' });
    }

    const itemTypes = [['listing', Listing], ['helper', Helper], ['service', Service], ['event', Event]];
    let item;
    let itemType;
    for (const [type, Model] of itemTypes) {
      item = await Model.findById(serviceId);
      if (item) { itemType = type; break; }
    }
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const providerId = item.userRef || item.creator;
    const itemPrice = Number(item.regularPrice ?? item.price);
    if (!providerId || !Number.isFinite(itemPrice) || itemPrice < 5) {
      return res.status(400).json({ success: false, message: 'This item cannot be purchased.' });
    }
    const paymentIntent = await PaymentIntent.create({
      purchaserId: userId, providerId, itemId: item._id, itemType, amount: itemPrice,
    });

    const safeAmount = itemPrice.toFixed(2);
    const safeItemName = `Secure Escrow: ${item.name}`.substring(0, 99);
    
    const payfast = generatePayfastData({
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount: safeAmount,
      item_name: safeItemName,
      name_first: name || 'LoopOut',
      name_last: 'Client',
      email_address: email || 'user@example.com',
      m_payment_id: `escrow-${paymentIntent._id}`,
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
    if (!isValidPayfastItn(itnData)) {
      return res.status(400).send('Invalid payment notification');
    }
    if (itnData.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      return res.status(400).send('Unexpected merchant');
    }

    if (itnData.payment_status === 'COMPLETE') {
      const paymentId = itnData.m_payment_id;
      
      if (paymentId.startsWith('escrow-')) {
        const intentId = paymentId.slice('escrow-'.length);
        const intent = await PaymentIntent.findById(intentId);
        if (!intent || intent.status === 'paid') return res.status(200).send('OK');
        if (Number(itnData.amount_gross) !== intent.amount) {
          return res.status(400).send('Unexpected payment amount');
        }

        // Find existing booking or create one
        let booking = await Booking.findOne({ 
          $or: [{ listing: intent.itemId }, { helper: intent.itemId }, { service: intent.itemId }],
          user: intent.purchaserId,
          status: 'pending'
        }).sort({ createdAt: -1 });

        if (booking) {
          booking.status = 'confirmed';
          await booking.save();
        }

        // Record in Escrow model
        const newEscrow = new Escrow({
          bookingId: booking ? booking._id : new mongoose.Types.ObjectId(),
          clientId: intent.purchaserId,
          providerId: intent.providerId,
          amount: intent.amount,
          status: 'held',
          paymentId: itnData.pf_payment_id,
          mPaymentId: paymentId
        });

        await newEscrow.save();
        intent.status = 'paid';
        intent.payfastPaymentId = itnData.pf_payment_id;
        await intent.save();
        
        // Notify both parties
        // (Implementation for professional notification could go here)
      } else if (paymentId.startsWith('listing-up-')) {
        console.log(`[PAYMENT SUCCESS] Listing upgrade confirmed for payment ID: ${paymentId}`);
        // Handle listing upgrade logic
      } else if (paymentId.startsWith('promo-')) {
        const [, promotionPackage, userId, listingId] = paymentId.split('-');
        const expectedAmount = promotionPackage === 'premium' ? 100 : 40;
        if (!['standard', 'premium'].includes(promotionPackage) || Number(itnData.amount_gross) !== expectedAmount) {
          return res.status(400).send('Unexpected promotion payment');
        }

        const listing = await Listing.findOne({ _id: listingId, userRef: userId });
        if (!listing) return res.status(404).send('Listing not found');

        listing.isPromoted = true;
        listing.promotionPackage = promotionPackage;
        await listing.save();
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
    const { amount, accountDetails } = req.body;
    const userId = req.user.id;

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
