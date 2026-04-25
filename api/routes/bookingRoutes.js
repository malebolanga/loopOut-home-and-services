import express from 'express';
import { calculateBookingDetails, createBooking, getBookedDates, getHostBookings, getUserBookings, updateBookingStatus, getHelperBookingSummary, getServiceBookingSummary, getListingBookingSummary } from '../controllers/booking.js';

const router = express.Router();

router.post('/calculate', calculateBookingDetails);
router.post('/', createBooking);
router.get('/booked-dates/:listingId', getBookedDates);
router.get('/host/:hostId', getHostBookings);
router.get('/user/:userId', getUserBookings);
router.get('/helper-summary/:helperId', getHelperBookingSummary);
router.get('/service-summary/:serviceId', getServiceBookingSummary);
router.get('/listing-summary/:listingId', getListingBookingSummary);
router.post('/update/:bookingId', updateBookingStatus);

export default router;