import express from 'express';
import {
  createBookingRequest,
  approveBooking,
  declineBooking,
  payBooking,
  cancelBooking,
  getPassengerBookings,
  getDriverBookings,
} from '../controllers/shuttleBooking.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/request', verifyToken, createBookingRequest);
router.get('/my-bookings', verifyToken, getPassengerBookings);
router.get('/driver-bookings', verifyToken, getDriverBookings);
router.put('/approve/:id', verifyToken, approveBooking);
router.put('/decline/:id', verifyToken, declineBooking);
router.put('/pay/:id', verifyToken, payBooking);
router.put('/cancel/:id', verifyToken, cancelBooking);

export default router;
