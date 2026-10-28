import express from 'express';
import { calculateBookingDetails, createBooking, getBookedDates, getHostBookings, getUserBookings, updateBookingStatus, getHelperBookingSummary, getServiceBookingSummary, getListingBookingSummary, getEventBookingSummary, getBookingById, getProviderLocation, updateProviderLocation, stopProviderLocation } from '../controllers/booking.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/calculate', calculateBookingDetails);
router.post('/', verifyToken, createBooking);
router.get('/booked-dates/:listingId', getBookedDates);
router.get('/host/:hostId', verifyToken, getHostBookings);
router.get('/user/:userId', verifyToken, getUserBookings);
router.get('/helper-summary/:helperId', verifyToken, getHelperBookingSummary);
router.get('/service-summary/:serviceId', verifyToken, getServiceBookingSummary);
router.get('/listing-summary/:listingId', verifyToken, getListingBookingSummary);
router.get('/event-summary/:eventId', verifyToken, getEventBookingSummary);
router.post('/update/:bookingId', verifyToken, updateBookingStatus);
router.get('/:bookingId/live-location', verifyToken, getProviderLocation);
router.put('/:bookingId/live-location', verifyToken, updateProviderLocation);
router.delete('/:bookingId/live-location', verifyToken, stopProviderLocation);
router.get('/:id', verifyToken, getBookingById);

export default router;
