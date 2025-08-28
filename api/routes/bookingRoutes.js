// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Calculate booking details
router.post('/calculate', bookingController.calculateBookingDetails);

// Create booking
router.post('/', bookingController.createBooking);

module.exports = router;