import express from 'express';
import {
  createBookingRequest,
  approveBooking,
  declineBooking,
  getBookingReferralOptions,
  referBooking,
  reportPayment,
  payBooking,
  cancelBooking,
  getPassengerBookings,
  getDriverBookings,
  rateTrip,
} from '../controllers/shuttleBooking.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/request', verifyToken, createBookingRequest);
router.get('/my-bookings', verifyToken, getPassengerBookings);
router.get('/driver-bookings', verifyToken, getDriverBookings);
router.put('/approve/:id', verifyToken, approveBooking);
router.put('/decline/:id', verifyToken, declineBooking);
router.get('/referral-options/:id', verifyToken, getBookingReferralOptions);
router.put('/refer/:id', verifyToken, referBooking);
router.put('/report-payment/:id', verifyToken, reportPayment);
router.put('/pay/:id', verifyToken, payBooking);
router.put('/cancel/:id', verifyToken, cancelBooking);
router.put('/rate/:id', verifyToken, rateTrip);   // Passenger rates trip ★

export default router;
