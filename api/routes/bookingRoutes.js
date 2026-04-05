import express from 'express';
import { calculateBookingDetails, createBooking, getBookedDates, getHostBookings, updateBookingStatus } from '../controllers/booking.js';

const router = express.Router();

router.post('/calculate', calculateBookingDetails);
router.post('/', createBooking);
router.get('/booked-dates/:listingId', getBookedDates);
router.get('/host/:hostId', getHostBookings);
router.post('/update/:bookingId', updateBookingStatus);

export default router;