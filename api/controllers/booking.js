import Booking from '../models/Booking.js';
import Listing from '../models/listing.model.js';

// Calculate price and validate dates
export const calculateBookingDetails = async (req, res) => {
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
export const createBooking = async (req, res) => {
  try {
    const { userId, listingId, startDate, endDate, totalPrice, phone, message } = req.body;

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
      phone,
      message,
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

// Get booked dates for a listing
export const getBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;
    const bookings = await Booking.find({ 
      listing: listingId,
      status: { $in: ['pending', 'confirmed', 'approved'] }
    });
    
    // Extract dates
    const bookedDates = bookings.map(b => ({
      start: b.startDate,
      end: b.endDate
    }));
    
    res.json(bookedDates);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get bookings for a host
export const getHostBookings = async (req, res) => {
  try {
    const { hostId } = req.params;
    
    // First find all listings for this host
    const listings = await Listing.find({ userRef: hostId });
    const listingIds = listings.map(l => l._id);
    
    // Find all bookings for these listings
    const bookings = await Booking.find({ 
      listing: { $in: listingIds } 
    }).populate('listing').populate('user');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
    
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};