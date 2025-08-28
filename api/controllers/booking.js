// controllers/bookingController.js
const Booking = require('../models/Booking');
const Listing = require('../pages/Listing');

// Calculate price and validate dates
const calculateBookingDetails = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    
    // Validate input
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get listing price
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Convert dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Calculate nights
    const timeDifference = end.getTime() - start.getTime();
    const numberOfNights = Math.ceil(timeDifference / (1000 * 3600 * 24));

    // Calculate total price
    const pricePerNight = listing.regularPrice;
    const totalPrice = pricePerNight * numberOfNights;

    res.json({
      numberOfNights,
      totalPrice,
      pricePerNight,
      currency: 'ZAR' // South African Rand
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const { userId, listingId, startDate, endDate, totalPrice } = req.body;

    // Validate input
    if (!userId || !listingId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new booking
    const newBooking = new Booking({
      user: userId,
      listing: listingId,
      startDate,
      endDate,
      totalPrice,
      status: 'pending'
    });

    await newBooking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  calculateBookingDetails,
  createBooking
};