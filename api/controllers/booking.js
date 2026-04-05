import Booking from '../models/Booking.js';
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Notification from '../models/notification.model.js';

// Calculate price and validate dates
export const calculateBookingDetails = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    
    // Validate input
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check Listing
    let item = await Listing.findById(listingId);
    if (!item) {
      // Check Helper
      item = await Helper.findById(listingId);
    }
    if (!item) {
      // Check Service
      item = await Service.findById(listingId);
    }

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Convert dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate nights or sessions
    const timeDifference = Math.max(0, end.getTime() - start.getTime());
    const numberOfUnits = Math.ceil(timeDifference / (1000 * 3600 * 24)) || 1;

    // Calculate total price
    const pricePerUnit = item.regularPrice;
    const totalPrice = pricePerUnit * numberOfUnits;

    res.json({
      numberOfUnits,
      totalPrice,
      pricePerUnit,
      currency: 'ZAR'
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create booking
export const createBooking = async (req, res) => {
  try {
    const { userId, listingId, helperId, serviceId, startDate, endDate, totalPrice, phone, message } = req.body;

    // Validate input
    const mainId = listingId || helperId || serviceId;
    if (!userId || !mainId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new booking
    const newBooking = new Booking({
      user: userId,
      listing: listingId || undefined,
      helper: helperId || undefined,
      service: serviceId || undefined,
      startDate,
      endDate,
      totalPrice,
      phone,
      message,
      status: 'pending'
    });

    await newBooking.save();

    // Create notification for the host
    try {
      let item;
      if (listingId) item = await Listing.findById(listingId);
      else if (helperId) item = await Helper.findById(helperId);
      else if (serviceId) item = await Service.findById(serviceId);

      if (item && item.userRef) {
        const hostNotification = new Notification({
          userId: item.userRef,
          type: 'booking',
          title: 'New Booking Request',
          message: `You have a new booking request for "${item.name}" - ZAR ${totalPrice}`,
          data: { bookingId: newBooking._id, type: listingId ? 'stay' : 'service' }
        });
        await hostNotification.save();
      }
    } catch (notifErr) {
      console.error('Failed to create host notification:', notifErr);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booked dates
export const getBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;
    const bookings = await Booking.find({ 
      $or: [
        { listing: listingId },
        { helper: listingId },
        { service: listingId }
      ],
      status: { $in: ['pending', 'confirmed', 'approved'] }
    });
    
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
    
    // Find all items associated with this host
    const listings = await Listing.find({ userRef: hostId });
    const helpers = await Helper.find({ userRef: hostId });
    const services = await Service.find({ userRef: hostId });

    const listingIds = listings.map(l => l._id);
    const helperIds = helpers.map(h => h._id);
    const serviceIds = services.map(s => s._id);
    
    // Find all bookings for these items
    const bookings = await Booking.find({ 
      $or: [
        { listing: { $in: listingIds } },
        { helper: { $in: helperIds } },
        { service: { $in: serviceIds } }
      ]
    })
    .populate('listing')
    .populate('helper')
    .populate('service')
    .populate('user')
    .sort({ createdAt: -1 });
    
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