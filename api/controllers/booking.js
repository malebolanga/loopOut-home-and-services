import Booking from '../models/Booking.js';
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Event from '../models/event.model.js';
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
      // Check Event
      item = await Event.findById(listingId);
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
    const { userId, listingId, helperId, serviceId, eventId, startDate, endDate, totalPrice, phone, message, subtype } = req.body;

    // Validate input
    const mainId = listingId || helperId || serviceId || eventId;
    if (!userId || !mainId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for overlaps to prevent dual booking
    const overlapQuery = {
      status: { $in: ['pending', 'confirmed', 'approved', 'ongoing', 'assigned'] },
      $or: [
        { startDate: { $lt: new Date(endDate) }, endDate: { $gt: new Date(startDate) } }
      ]
    };

    if (listingId) overlapQuery.listing = listingId;
    else if (helperId) overlapQuery.helper = helperId;
    else if (serviceId) overlapQuery.service = serviceId;
    else if (eventId) overlapQuery.event = eventId;

    const existingBooking = await Booking.findOne(overlapQuery);

    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already reserved (Pending or Confirmed). Please select another time.' });
    }

    // Create new booking
    const newBooking = new Booking({
      user: userId,
      listing: listingId || undefined,
      helper: helperId || undefined,
      service: serviceId || undefined,
      event: eventId || undefined,
      startDate,
      endDate,
      totalPrice,
      phone,
      message,
      subtype,
      status: 'pending'
    });

    await newBooking.save();

    // Increment bookingsCount for real data tracking
    if (listingId) await Listing.findByIdAndUpdate(listingId, { $inc: { bookingsCount: 1 } });
    if (helperId) await Helper.findByIdAndUpdate(helperId, { $inc: { bookingsCount: 1 } });
    if (serviceId) await Service.findByIdAndUpdate(serviceId, { $inc: { bookingsCount: 1 } });
    if (eventId) await Event.findByIdAndUpdate(eventId, { $inc: { bookingsCount: 1 } });

    // Create notification for the host
    try {
      let item;
      if (listingId) item = await Listing.findById(listingId);
      else if (helperId) item = await Helper.findById(helperId);
      else if (serviceId) item = await Service.findById(serviceId);
      else if (eventId) item = await Event.findById(eventId);

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
        { service: listingId },
        { event: listingId }
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

// Get bookings requested by a user
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    const bookings = await Booking.find({ user: userId })
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
    const { status, cancelledBy } = req.body; // cancelledBy: 'host' or 'user'
    
    // Find the booking and populate necessary fields
    const booking = await Booking.findById(bookingId)
      .populate('listing')
      .populate('helper')
      .populate('service')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();
    
    // Create notification if status changed, especially to 'cancelled'
    if (status === 'cancelled' || status !== previousStatus) {
      try {
        let recipientId;
        let title = 'Booking Update';
        let messageText = `The status of your booking for "${booking.listing?.name || booking.helper?.name || booking.service?.name}" has been updated to ${status}.`;

        const item = booking.listing || booking.helper || booking.service;
        const hostId = item?.userRef;
        const clientId = booking.user?._id;

        // Determine recipient
        if (status === 'cancelled') {
           title = 'Booking Cancelled';
           if (cancelledBy === 'user') {
             // User cancelled -> Notify Host
             recipientId = hostId;
             messageText = `Client ${booking.user?.username || 'User'} has cancelled their booking for "${item?.name}".`;
           } else {
             // Host cancelled -> Notify User
             recipientId = clientId;
             messageText = `Professional ${item?.name || 'Host'} has cancelled your booking.`;
           }
        } else if (status === 'confirmed') {
           title = 'Booking Confirmed';
           recipientId = clientId;
           messageText = `Your booking for "${item?.name}" has been confirmed by the professional!`;
        } else {
           // Generic update: notify the other party
           // If current user is host, notify user. If user, notify host.
           // However, usually only host updates status here.
           recipientId = clientId;
        }

        if (recipientId) {
          const newNotif = new Notification({
            userId: recipientId,
            type: 'booking',
            title,
            message: messageText,
            data: { bookingId: booking._id, status }
          });
          await newNotif.save();
        }
      } catch (notifErr) {
        console.error('Failed to create status update notification:', notifErr);
      }
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking summary for a specific helper
export const getHelperBookingSummary = async (req, res) => {
  try {
    const { helperId } = req.params;
    
    const bookings = await Booking.find({ helper: helperId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
      
    const count = bookings.length;
    
    // Get unique users who booked
    const recentBookers = [];
    const seenUsers = new Set();
    
    for (const booking of bookings) {
      if (booking.user && !seenUsers.has(booking.user._id.toString())) {
        recentBookers.push(booking.user);
        seenUsers.add(booking.user._id.toString());
      }
      if (recentBookers.length >= 5) break;
    }

    res.json({
      count,
      recentBookers
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking summary for a specific service
export const getServiceBookingSummary = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const bookings = await Booking.find({ service: serviceId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
      
    const count = bookings.length;
    
    const recentBookers = [];
    const seenUsers = new Set();
    
    for (const booking of bookings) {
      if (booking.user && !seenUsers.has(booking.user._id.toString())) {
        recentBookers.push(booking.user);
        seenUsers.add(booking.user._id.toString());
      }
      if (recentBookers.length >= 5) break;
    }

    res.json({
      count,
      recentBookers
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking summary for a specific listing
export const getListingBookingSummary = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const bookings = await Booking.find({ listing: listingId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
      
    const count = bookings.length;
    
    const recentBookers = [];
    const seenUsers = new Set();
    
    for (const booking of bookings) {
      if (booking.user && !seenUsers.has(booking.user._id.toString())) {
        recentBookers.push(booking.user);
        seenUsers.add(booking.user._id.toString());
      }
      if (recentBookers.length >= 5) break;
    }

    res.json({
      count,
      recentBookers
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
// Get booking summary for a specific event
export const getEventBookingSummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const bookings = await Booking.find({ event: eventId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
      
    const count = bookings.length;
    
    const recentBookers = [];
    const seenUsers = new Set();
    
    for (const booking of bookings) {
      if (booking.user && !seenUsers.has(booking.user._id.toString())) {
        recentBookers.push(booking.user);
        seenUsers.add(booking.user._id.toString());
      }
      if (recentBookers.length >= 5) break;
    }

    res.json({
      count,
      recentBookers
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
