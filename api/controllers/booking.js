import Booking from '../models/Booking.js';
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Event from '../models/event.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Calculate price and validate dates (public - used by client before booking)
export const calculateBookingDetails = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let item = await Listing.findById(listingId);
    if (!item) item = await Helper.findById(listingId);
    if (!item) item = await Service.findById(listingId);
    if (!item) item = await Event.findById(listingId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const timeDifference = Math.max(0, end.getTime() - start.getTime());
    const numberOfUnits = Math.ceil(timeDifference / (1000 * 3600 * 24)) || 1;

    const pricePerUnit = item.regularPrice;
    const totalPrice = pricePerUnit * numberOfUnits;

    res.json({ numberOfUnits, totalPrice, pricePerUnit, currency: 'ZAR' });

  } catch (error) {
    console.error('[calculateBookingDetails] error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create booking (requires authentication via verifyToken middleware)
export const createBooking = async (req, res) => {
  try {
    // Always use the authenticated user — never trust client-supplied userId
    const authenticatedUserId = req.user.id;
    const {
      listingId, helperId, serviceId, eventId,
      startDate, endDate,
      phone, message, subtype,
      selectedPerformer, performerExperience, performerImage
    } = req.body;

    const mainId = listingId || helperId || serviceId || eventId;
    if (!mainId || !startDate || !endDate) {
      console.warn('[createBooking] validation failed: missing required fields', { mainId, startDate, endDate });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch item from DB to calculate server-authoritative price
    let item;
    if (listingId) item = await Listing.findById(listingId);
    else if (helperId) item = await Helper.findById(helperId);
    else if (serviceId) item = await Service.findById(serviceId);
    else if (eventId) item = await Event.findById(eventId);

    if (!item) {
      console.warn('[createBooking] validation failed: item not found', { mainId });
      return res.status(404).json({ error: 'Listing or item not found' });
    }

    // Server-side total price — never trust client-supplied totalPrice
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      console.warn('[createBooking] validation failed: invalid date range', { startDate, endDate });
      return res.status(400).json({ error: 'Invalid date range' });
    }
    const timeDifference = end.getTime() - start.getTime();
    const numberOfUnits = Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    const serverTotalPrice = (item.regularPrice || 0) * numberOfUnits;

    // Overlap check to prevent double-booking
    const overlapQuery = {
      status: { $in: ['pending', 'confirmed', 'approved', 'ongoing', 'assigned'] },
      $and: [{ startDate: { $lt: new Date(endDate) } }, { endDate: { $gt: new Date(startDate) } }]
    };
    if (listingId) overlapQuery.listing = listingId;
    else if (helperId) overlapQuery.helper = helperId;
    else if (serviceId) overlapQuery.service = serviceId;
    else if (eventId) overlapQuery.event = eventId;

    const existingBooking = await Booking.findOne(overlapQuery);
    if (existingBooking) {
      console.warn('[createBooking] validation failed: time slot already reserved', { overlapQuery, existingBookingId: existingBooking._id });
      return res.status(400).json({ error: 'This time slot is already reserved. Please select another time.' });
    }

    // Create booking with server-authoritative user ID and price
    const newBooking = new Booking({
      user: authenticatedUserId,
      listing: listingId || undefined,
      helper: helperId || undefined,
      service: serviceId || undefined,
      event: eventId || undefined,
      startDate,
      endDate,
      totalPrice: serverTotalPrice,
      phone,
      message,
      subtype,
      selectedPerformer,
      performerExperience,
      performerImage,
      status: 'pending'
    });

    await newBooking.save();

    // Increment bookingsCount
    if (listingId) await Listing.findByIdAndUpdate(listingId, { $inc: { bookingsCount: 1 } });
    if (helperId) await Helper.findByIdAndUpdate(helperId, { $inc: { bookingsCount: 1 } });
    if (serviceId) await Service.findByIdAndUpdate(serviceId, { $inc: { bookingsCount: 1 } });
    if (eventId) await Event.findByIdAndUpdate(eventId, { $inc: { bookingsCount: 1 } });

    // Notify host & guest
    const itemName = item ? (item.name || item.title || 'Service') : 'Service';
    try {
      if (item && item.userRef) {
        await new Notification({
          userId: item.userRef,
          type: 'booking',
          title: 'New Booking Request',
          message: `You have a new booking request for "${itemName}" - ZAR ${serverTotalPrice.toLocaleString()}`,
          data: { bookingId: newBooking._id, type: listingId ? 'stay' : 'service' }
        }).save();
      }
    } catch (notifErr) {
      console.error('Failed to create host notification:', notifErr);
    }

    try {
      if (authenticatedUserId) {
        await new Notification({
          userId: authenticatedUserId,
          type: 'booking',
          title: 'Booking Request Placed',
          message: `Your booking request for "${itemName}" has been submitted (ZAR ${serverTotalPrice.toLocaleString()}).`,
          data: { bookingId: newBooking._id, type: listingId ? 'stay' : 'service' }
        }).save();
      }
    } catch (notifErr) {
      console.error('Failed to create guest notification:', notifErr);
    }

    res.status(201).json({
      message: 'Booking request created. Host has been notified.',
      booking: newBooking,
      serverTotalPrice
    });

  } catch (error) {
    console.error('[createBooking] error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booked dates (public - used by calendar availability display)
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

    const bookedDates = bookings.map(b => ({ start: b.startDate, end: b.endDate }));
    res.json(bookedDates);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get bookings for a host (requires authentication; only own bookings accessible)
export const getHostBookings = async (req, res) => {
  try {
    const { hostId } = req.params;

    if (!hostId || hostId === 'undefined' || hostId === 'null') {
      return res.status(400).json({ error: 'Valid Host ID is required' });
    }

    if (req.user.id !== hostId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      return res.status(400).json({ error: 'Valid Host ID is required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connecting, please retry' });
    }

    const listings = await Listing.find({ userRef: hostId });
    const helpers = await Helper.find({ userRef: hostId });
    const services = await Service.find({ userRef: hostId });
    const events = await Event.find({ userRef: hostId });

    const listingIds = listings.map(l => l._id);
    const helperIds = helpers.map(h => h._id);
    const serviceIds = services.map(s => s._id);
    const eventIds = events.map(e => e._id);

    const bookings = await Booking.find({
      $or: [
        { listing: { $in: listingIds } },
        { helper: { $in: helperIds } },
        { service: { $in: serviceIds } },
        { event: { $in: eventIds } }
      ]
    })
      .populate({ path: 'listing', populate: { path: 'userRef' } })
      .populate({ path: 'helper', populate: { path: 'userRef' } })
      .populate({ path: 'service', populate: { path: 'userRef' } })
      .populate({ path: 'event', populate: { path: 'userRef' } })
      .populate('user')
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error('[HOST BOOKINGS] Error:', error.message);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Get bookings for a user (requires authentication; only own bookings accessible)
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connecting, please retry' });
    }

    let bookings;
    try {
      bookings = await Booking.find({ user: userId })
        .populate({ path: 'listing', select: 'name title imageUrls address regularPrice userRef', populate: { path: 'userRef', select: 'username avatar' } })
        .populate({ path: 'helper', select: 'name title imageUrls address regularPrice userRef', populate: { path: 'userRef', select: 'username avatar' } })
        .populate({ path: 'service', select: 'name title imageUrls address price userRef', populate: { path: 'userRef', select: 'username avatar' } })
        .populate({ path: 'event', select: 'name title imageUrls address price userRef', populate: { path: 'userRef', select: 'username avatar' } })
        .populate('user', 'username avatar email phone')
        .sort({ createdAt: -1 })
        .lean();
    } catch (populateErr) {
      console.error('[BOOKINGS] Populate error, falling back to plain query:', populateErr.message);
      bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 }).lean();
    }

    return res.json(bookings);
  } catch (error) {
    console.error('[BOOKINGS] getUserBookings error:', error.message);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get single booking by ID (requires authentication; only host or booking owner may view)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate({ path: 'listing', populate: { path: 'userRef' } })
      .populate({ path: 'helper', populate: { path: 'userRef' } })
      .populate({ path: 'service', populate: { path: 'userRef' } })
      .populate('user', 'username email avatar phone')
      .populate({ path: 'event', populate: { path: 'userRef' } });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const item = booking.listing || booking.helper || booking.service || booking.event;
    const hostId = item?.userRef?._id?.toString() || item?.userRef?.toString();
    const bookingUserId = booking.user?._id?.toString() || booking.user?.toString();
    const callerId = req.user.id;

    if (callerId !== hostId && callerId !== bookingUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update booking status (requires authentication; only host or booking owner may update)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, cancelledBy } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate({ path: 'listing', populate: { path: 'userRef' } })
      .populate({ path: 'helper', populate: { path: 'userRef' } })
      .populate({ path: 'service', populate: { path: 'userRef' } })
      .populate({ path: 'event', populate: { path: 'userRef' } })
      .populate('user');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const item = booking.listing || booking.helper || booking.service || booking.event;
    const hostId = item?.userRef?._id?.toString() || item?.userRef?.toString();
    const bookingUserId = booking.user?._id?.toString() || booking.user?.toString();
    const callerId = req.user.id;

    if (callerId !== hostId && callerId !== bookingUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allowedByGuest = ['cancelled'];
    const allowedByHost = ['confirmed', 'approved', 'declined', 'cancelled', 'completed', 'assigned', 'enroute', 'ongoing'];
    if (!req.user.isAdmin) {
      const allowedStatuses = callerId === bookingUserId ? allowedByGuest : allowedByHost;
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({ error: 'You are not allowed to set that booking status.' });
      }
    }

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();

    const itemName = item?.name || item?.title || 'Service';

    // Notify relevant party of status change
    if (status !== previousStatus) {
      try {
        let recipientId;
        let title = 'Booking Update';
        let messageText = `The status of your booking for "${itemName}" has been updated to ${status}.`;

        if (status === 'cancelled') {
          title = 'Booking Cancelled';
          if (cancelledBy === 'user') {
            recipientId = hostId;
            messageText = `Client ${booking.user?.username || 'User'} has cancelled their booking for "${itemName}".`;
          } else {
            recipientId = bookingUserId;
            messageText = `Your booking for "${itemName}" has been cancelled by the host.`;
          }
        } else if (status === 'confirmed' || status === 'approved') {
          title = 'Booking Confirmed';
          recipientId = bookingUserId;
          messageText = `Your booking for "${itemName}" has been confirmed!`;
        } else if (status === 'declined') {
          title = 'Booking Declined';
          recipientId = bookingUserId;
          messageText = `Your booking for "${itemName}" was declined by the host.`;
        } else {
          recipientId = bookingUserId;
        }

        if (recipientId) {
          await new Notification({
            userId: recipientId,
            type: 'booking',
            title,
            message: messageText,
            data: { bookingId: booking._id, status }
          }).save();
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

// Helper for populating user locations and checking for mutual friends
const getRecentBookersWithMutual = async (bookings, req) => {
  const recentBookers = [];
  const seenUsers = new Set();

  for (const booking of bookings) {
    if (booking.user && !seenUsers.has(booking.user._id.toString())) {
      recentBookers.push(booking.user);
      seenUsers.add(booking.user._id.toString());
    }
    if (recentBookers.length >= 5) break;
  }

  const token = req.cookies?.access_token || req.headers?.authorization?.split(' ')[1];
  let userContactsSet = new Set();
  let hasContactsEnabled = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('contacts accessContacts');
      if (currentUser && currentUser.accessContacts && currentUser.contacts?.length > 0) {
        hasContactsEnabled = true;
        const normalize = (p) => p.replace(/\D/g, '').slice(-9);
        userContactsSet = new Set(currentUser.contacts.map(normalize));
      }
    } catch (err) {
      // Ignore token decode errors — mutual contacts is optional
    }
  }

  return recentBookers.map(u => {
    let isMutual = false;
    if (hasContactsEnabled && u.phone) {
      const normalize = (p) => p.replace(/\D/g, '').slice(-9);
      const normPhone = normalize(u.phone);
      isMutual = normPhone.length >= 9 && userContactsSet.has(normPhone);
    }
    return { _id: u._id, username: u.username, avatar: u.avatar, location: u.location || '', isMutual };
  });
};

// Get booking summary for a specific helper
export const getHelperBookingSummary = async (req, res) => {
  try {
    const { helperId } = req.params;
    const bookings = await Booking.find({ helper: helperId })
      .populate('user', 'username avatar phone location')
      .sort({ createdAt: -1 });

    const count = bookings.length;
    const deviceStats = { Mobile: 0, Desktop: 0 };
    const locationStats = {};

    bookings.forEach(b => {
      if (b.deviceType) deviceStats[b.deviceType] = (deviceStats[b.deviceType] || 0) + 1;
      if (b.requestLocation) locationStats[b.requestLocation] = (locationStats[b.requestLocation] || 0) + 1;
    });

    const recentBookers = await getRecentBookersWithMutual(bookings, req);
    res.json({ count, recentBookers, analytics: { deviceStats, locationStats } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking summary for a specific service
export const getServiceBookingSummary = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const bookings = await Booking.find({ service: serviceId })
      .populate('user', 'username avatar phone location')
      .sort({ createdAt: -1 });

    const count = bookings.length;
    const deviceStats = { Mobile: 0, Desktop: 0 };
    const locationStats = {};

    bookings.forEach(b => {
      if (b.deviceType) deviceStats[b.deviceType] = (deviceStats[b.deviceType] || 0) + 1;
      if (b.requestLocation) locationStats[b.requestLocation] = (locationStats[b.requestLocation] || 0) + 1;
    });

    const recentBookers = await getRecentBookersWithMutual(bookings, req);
    res.json({ count, recentBookers, analytics: { deviceStats, locationStats } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking summary for a specific listing
export const getListingBookingSummary = async (req, res) => {
  try {
    const { listingId } = req.params;
    const bookings = await Booking.find({ listing: listingId })
      .populate('user', 'username avatar phone location')
      .sort({ createdAt: -1 });

    const count = bookings.length;
    const deviceStats = { Mobile: 0, Desktop: 0 };
    const locationStats = {};

    bookings.forEach(b => {
      if (b.deviceType) deviceStats[b.deviceType] = (deviceStats[b.deviceType] || 0) + 1;
      if (b.requestLocation) locationStats[b.requestLocation] = (locationStats[b.requestLocation] || 0) + 1;
    });

    const recentBookers = await getRecentBookersWithMutual(bookings, req);
    res.json({ count, recentBookers, analytics: { deviceStats, locationStats } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking summary for a specific event
export const getEventBookingSummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    const bookings = await Booking.find({ event: eventId })
      .populate('user', 'username avatar phone location')
      .sort({ createdAt: -1 });

    const count = bookings.length;
    const deviceStats = { Mobile: 0, Desktop: 0 };
    const locationStats = {};

    bookings.forEach(b => {
      if (b.deviceType) deviceStats[b.deviceType] = (deviceStats[b.deviceType] || 0) + 1;
      if (b.requestLocation) locationStats[b.requestLocation] = (locationStats[b.requestLocation] || 0) + 1;
    });

    const recentBookers = await getRecentBookersWithMutual(bookings, req);
    res.json({ count, recentBookers, analytics: { deviceStats, locationStats } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
