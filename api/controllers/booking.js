import Booking from '../models/Booking.js';
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Event from '../models/event.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Escrow from '../models/escrow.model.js';
import HelperComment from '../models/helper-comment.model.js';
import ServiceComment from '../models/service-comment.model.js';
import Comment from '../models/comment.model.js';
import EventComment from '../models/event-comment.model.js';
import ProviderLiveLocation from '../models/ProviderLiveLocation.js';
import { sendPushNotificationToUser } from '../utils/pushNotifications.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const shouldSendBookingPush = async (userId, preference = 'activity.bookingUpdates') => {
  try {
    const user = await User.findById(userId).select('notificationPreferences');
    if (!user) return true;
    const [group, key] = preference.split('.');
    return user.notificationPreferences?.[group]?.[key] !== false;
  } catch {
    return true;
  }
};

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
  let eventTicketsReserved = 0;
  let eventBookingSaved = false;
  try {
    // Always use the authenticated user — never trust client-supplied userId
    const authenticatedUserId = req.user.id;
    const {
      listingId, helperId, serviceId, eventId,
      startDate, endDate,
      totalPrice, price,
      phone, message, subtype, numberOfGuests, functionType,
      selectedPerformer, performerExperience, performerImage, numberOfRooms, accommodationSelection,
      serviceDuration, selectedHaircut, beardGrooming, specialRequirements,
      foodProvided, electricityProvided,
      breakfast,
      vehicleType, vehicleMake, vehicleModel,
      requestLocation, locationOption
    } = req.body;

    const mainId = listingId || helperId || serviceId || eventId;
    if (!mainId || !startDate || !endDate) {
      console.warn('[createBooking] validation failed: missing required fields', { mainId, startDate, endDate });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedGuestCount = numberOfGuests === '' || numberOfGuests === undefined
      ? undefined
      : Number(numberOfGuests);
    if (parsedGuestCount !== undefined && (!Number.isInteger(parsedGuestCount) || parsedGuestCount < 1)) {
      return res.status(400).json({ error: 'Number of guests must be a positive whole number.' });
    }
    const parsedRoomCount = numberOfRooms === '' || numberOfRooms === undefined ? 1 : Number(numberOfRooms);
    let bookingRoomCount = parsedRoomCount;
    if (!Number.isInteger(parsedRoomCount) || parsedRoomCount < 1) {
      return res.status(400).json({ error: 'Number of rooms must be a positive whole number.' });
    }
    if (accommodationSelection !== undefined && !['entire', 'rooms'].includes(accommodationSelection)) {
      return res.status(400).json({ error: 'Choose the whole property or select rooms to book.' });
    }

    // Fetch item from DB to calculate server-authoritative price fallback
    let item;
    if (listingId) item = await Listing.findById(listingId);
    else if (helperId) item = await Helper.findById(helperId);
    else if (serviceId) item = await Service.findById(serviceId);
    else if (eventId) item = await Event.findById(eventId);

    if (!item) {
      console.warn('[createBooking] validation failed: item not found', { mainId });
      return res.status(404).json({ error: 'Listing or item not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      console.warn('[createBooking] validation failed: invalid date range', { startDate, endDate });
      return res.status(400).json({ error: 'Invalid date range' });
    }
    if (start.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Bookings must start in the future. Please choose a new date or time.' });
    }
    const ownerId = (item.userRef?._id || item.userRef || item.creator?._id || item.creator)?.toString?.();
    if (ownerId && ownerId === authenticatedUserId) {
      return res.status(403).json({ error: 'You cannot book your own listing or service.' });
    }
    const timeDifference = Math.max(0, end.getTime() - start.getTime());
    const numberOfUnits = Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    const ratePeriod = item.pricePeriod || (item.type === 'over' ? 'night' : item.type === 'office' ? 'hour' : 'day');
    const listedBasePrice = Number(item.regularPrice) || 0;
    const basePrice = item.offer && Number(item.discountPrice) > 0 && Number(item.discountPrice) < listedBasePrice
      ? Number(item.discountPrice)
      : listedBasePrice;
    const selectedRoom = listingId && Array.isArray(item.roomTypes) ? item.roomTypes.find((room) => room.name === subtype) : null;
    const selectedService = Array.isArray(item.serviceList) ? item.serviceList.find((service) => service.name === subtype) : null;
    const selectedPrice = Number(selectedRoom?.price ?? selectedService?.price);
    const unitPrice = Number.isFinite(selectedPrice) && selectedPrice >= 0 ? selectedPrice : basePrice;
    let resolvedTotalPrice = unitPrice;
    if (eventId) {
      resolvedTotalPrice = basePrice * (parsedGuestCount || 1);
    } else if (listingId && ['day', 'night'].includes(ratePeriod)) {
      const roomMultiplier = accommodationSelection === 'entire' ? 1 : parsedRoomCount;
      resolvedTotalPrice = unitPrice * numberOfUnits * roomMultiplier
        + (breakfast === true ? 150 * numberOfUnits * (parsedGuestCount || 1) : 0)
        + (parsedGuestCount > 2 ? (parsedGuestCount - 2) * 200 * numberOfUnits : 0);
    } else if (listingId && ratePeriod === 'hour') {
      resolvedTotalPrice = unitPrice * Math.max(1, timeDifference / (1000 * 60 * 60));
    } else if (listingId && ratePeriod === 'week') {
      resolvedTotalPrice = unitPrice * Math.max(1, Math.ceil(timeDifference / (7 * 24 * 60 * 60 * 1000)));
    } else if (listingId && ratePeriod === 'month') {
      resolvedTotalPrice = unitPrice * Math.max(1, Math.ceil(timeDifference / (30 * 24 * 60 * 60 * 1000)));
    }
    if (!Number.isFinite(resolvedTotalPrice) || resolvedTotalPrice < 0) {
      return res.status(400).json({ error: 'Could not calculate a valid booking price for this listing.' });
    }

    // Overlap check to prevent double-booking
    // For single-time appointments (like helpers/services where start == end), treat slot window as 1 hour
    const slotStart = new Date(startDate);
    const slotEnd = end.getTime() <= start.getTime()
      ? new Date(start.getTime() + 60 * 60 * 1000)
      : new Date(endDate);

    const overlapQuery = {
      status: { $in: ['pending', 'confirmed', 'approved', 'ongoing', 'assigned', 'enroute'] },
      $and: [
        { startDate: { $lt: slotEnd } },
        { 
          $or: [
            { endDate: { $gt: slotStart } },
            { $and: [{ endDate: { $gte: slotStart } }, { startDate: { $lte: slotStart } }] }
          ]
        }
      ]
    };
    if (listingId) overlapQuery.listing = listingId;
    else if (helperId) overlapQuery.helper = helperId;
    else if (serviceId) overlapQuery.service = serviceId;
    else if (eventId) overlapQuery.event = eventId;

    if (listingId) {
      const roomTypes = Array.isArray(item.roomTypes) ? item.roomTypes : [];
      const selectedRoomType = subtype && roomTypes.find(room => room.name === subtype);
      const isEntireProperty = accommodationSelection === 'entire' && ['house', 'apartment'].includes(String(item.kind || '').toLowerCase());
      const isResidence = ['house', 'apartment'].includes(String(item.kind || '').toLowerCase());
      const inventory = Math.max(1, Number(selectedRoomType?.count || (isResidence ? (item.bedrooms || item.numberOfRooms || item.totalUnits) : (item.numberOfRooms || item.numberOfApartments || item.totalUnits || item.bedrooms)) || 1));
      const requestedRoomCount = isEntireProperty ? inventory : parsedRoomCount;
      bookingRoomCount = requestedRoomCount;
      if (requestedRoomCount > inventory) {
        return res.status(400).json({ error: `Only ${inventory} ${selectedRoomType ? 'of this room type' : 'room(s)'} are available.` });
      }
      const overlappingBookings = await Booking.find({ ...overlapQuery, ...(selectedRoomType ? { subtype } : {}) })
        .select('startDate endDate numberOfRooms accommodationSelection');
      const occupancyPoints = [slotStart.getTime(), ...overlappingBookings.map(b => new Date(b.startDate).getTime())]
        .filter(time => time >= slotStart.getTime() && time < slotEnd.getTime());
      const maxOccupied = occupancyPoints.reduce((max, time) => {
        const occupied = overlappingBookings.reduce((sum, b) => {
          const starts = new Date(b.startDate).getTime();
          const ends = new Date(b.endDate).getTime();
          const bookedCount = b.accommodationSelection === 'entire' ? inventory : Math.max(1, Number(b.numberOfRooms) || 1);
          return sum + (starts <= time && ends > time ? bookedCount : 0);
        }, 0);
        return Math.max(max, occupied);
      }, 0);
      if (maxOccupied + requestedRoomCount > inventory) {
        return res.status(400).json({ error: `Only ${Math.max(0, inventory - maxOccupied)} room(s) remain available for some of those dates.` });
      }
    } else if (!eventId) {
      const existingBooking = await Booking.findOne(overlapQuery);
      if (existingBooking) {
        console.warn('[createBooking] validation failed: time slot already reserved', { overlapQuery, existingBookingId: existingBooking._id });
        return res.status(400).json({ error: 'This time slot or date is already reserved. Please select another time.' });
      }
    }

    if (eventId) {
      const ticketCount = parsedGuestCount || 1;
      if (Number(item.capacity) > 0) {
        const reservedEvent = await Event.findOneAndUpdate(
          {
            _id: eventId,
            $expr: { $lte: [{ $add: [{ $ifNull: ['$ticketsBooked', 0] }, ticketCount] }, '$capacity'] }
          },
          { $inc: { ticketsBooked: ticketCount } },
          { new: true }
        );
        if (!reservedEvent) return res.status(409).json({ error: 'This event has reached capacity. Please choose another event.' });
        eventTicketsReserved = ticketCount;
      } else {
        await Event.findByIdAndUpdate(eventId, { $inc: { ticketsBooked: ticketCount } });
        eventTicketsReserved = ticketCount;
      }
    }

    // Create booking with user-selected price
    const newBooking = new Booking({
      user: authenticatedUserId,
      listing: listingId || undefined,
      helper: helperId || undefined,
      service: serviceId || undefined,
      event: eventId || undefined,
      startDate: slotStart,
      endDate: slotEnd,
      totalPrice: resolvedTotalPrice,
      phone,
      message,
      subtype,
      numberOfGuests: parsedGuestCount,
      breakfast: breakfast === true,
      numberOfRooms: listingId ? bookingRoomCount : undefined,
      accommodationSelection: listingId ? accommodationSelection : undefined,
      functionType,
      selectedPerformer,
      performerExperience,
      performerImage,
      serviceDuration,
      selectedHaircut,
      beardGrooming,
      specialRequirements,
      foodProvided: ['yes', 'no'].includes(foodProvided) ? foodProvided : undefined,
      electricityProvided: ['yes', 'no'].includes(electricityProvided) ? electricityProvided : undefined,
      vehicleType: typeof vehicleType === 'string' ? vehicleType.trim() : undefined,
      vehicleMake: typeof vehicleMake === 'string' ? vehicleMake.trim() : undefined,
      vehicleModel: typeof vehicleModel === 'string' ? vehicleModel.trim() : undefined,
      requestLocation: typeof requestLocation === 'string' ? requestLocation.trim().slice(0, 500) : undefined,
      locationOption: ['comeToYou', 'goToThem'].includes(locationOption) ? locationOption : undefined,
      status: 'pending'
    });

    await newBooking.save();
    eventBookingSaved = true;

    // Increment bookingsCount
    if (listingId) await Listing.findByIdAndUpdate(listingId, { $inc: { bookingsCount: 1 } });
    if (helperId) await Helper.findByIdAndUpdate(helperId, { $inc: { bookingsCount: 1 } });
    if (serviceId) await Service.findByIdAndUpdate(serviceId, { $inc: { bookingsCount: 1 } });
    if (eventId) await Event.findByIdAndUpdate(eventId, { $inc: { bookingsCount: 1 } });

    // Notify host & guest with the selected booking price
    const itemName = item ? (item.name || item.title || 'Service') : 'Service';
    const itemType = listingId ? 'listing' : helperId ? 'helper' : serviceId ? 'service' : 'event';
    const itemId = listingId || helperId || serviceId || eventId;
    const hostUserId = item ? (item.userRef?._id || item.userRef || item.creator?._id || item.creator) : null;
    const bookingAddress = newBooking.requestLocation;
    const bookingLocationOption = newBooking.locationOption;
    const bookingMapLink = bookingAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingAddress)}` : undefined;

    try {
      if (hostUserId && await shouldSendBookingPush(hostUserId)) {
        await new Notification({
          userId: hostUserId,
          type: 'booking',
          title: 'New Booking Request',
          message: `You have a new booking request for "${itemName}" - ZAR ${resolvedTotalPrice.toLocaleString()}`,
          data: {
            bookingId: newBooking._id,
            itemType,
            itemId,
            price: resolvedTotalPrice,
            totalPrice: resolvedTotalPrice,
            vehicleType: newBooking.vehicleType,
            vehicleMake: newBooking.vehicleMake,
            vehicleModel: newBooking.vehicleModel,
            requestLocation: bookingAddress,
            clientAddress: bookingAddress,
            locationOption: bookingLocationOption,
            mapLink: bookingMapLink
          }
        }).save();
        sendPushNotificationToUser(hostUserId, {
            title: '📅 New Booking Request',
            body: `You have a new booking request for "${itemName}" (ZAR ${resolvedTotalPrice.toLocaleString()}).`,
            data: { bookingId: String(newBooking._id), type: 'booking', route: '/notifications' }
        }).catch((pushErr) => console.warn('[createBooking] Host push notification error:', pushErr.message));
      }
    } catch (notifErr) {
      console.error('Failed to create host notification:', notifErr);
    }

    try {
      if (authenticatedUserId && await shouldSendBookingPush(authenticatedUserId)) {
        await new Notification({
          userId: authenticatedUserId,
          type: 'booking',
          title: 'Booking Request Placed',
          message: `Your booking request for "${itemName}" has been submitted (ZAR ${resolvedTotalPrice.toLocaleString()}).`,
          data: {
            bookingId: newBooking._id,
            itemType,
            itemId,
            price: resolvedTotalPrice,
            totalPrice: resolvedTotalPrice,
            vehicleType: newBooking.vehicleType,
            vehicleMake: newBooking.vehicleMake,
            vehicleModel: newBooking.vehicleModel,
            requestLocation: bookingAddress,
            clientAddress: bookingAddress,
            locationOption: bookingLocationOption,
            mapLink: bookingMapLink
          }
        }).save();
        sendPushNotificationToUser(authenticatedUserId, {
          title: 'Booking Request Sent',
          body: `Your booking request for "${itemName}" has been sent.`,
          data: { bookingId: String(newBooking._id), type: 'booking', route: '/notifications' }
        }).catch((pushErr) => console.warn('[createBooking] Guest push notification error:', pushErr.message));
      }
    } catch (notifErr) {
      console.error('Failed to create guest notification:', notifErr);
    }

    res.status(201).json({
      message: 'Booking request created. Host has been notified.',
      booking: newBooking,
      serverTotalPrice: resolvedTotalPrice
    });

  } catch (error) {
    if (eventTicketsReserved > 0 && !eventBookingSaved) {
      await Event.updateOne({ _id: req.body.eventId }, { $inc: { ticketsBooked: -eventTicketsReserved } }).catch(() => {});
    }
    console.error('[createBooking] error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booked dates (public - used by calendar availability display)
export const getBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.json([]);
    }

    const bookings = await Booking.find({
      $or: [
        { listing: listingId },
        { helper: listingId },
        { service: listingId },
        { event: listingId }
      ],
      status: { $in: ['pending', 'confirmed', 'approved', 'ongoing', 'assigned', 'enroute'] }
    }).select('startDate endDate status');

    const bookedDates = bookings.map(b => ({
      start: b.startDate,
      end: b.endDate,
      status: b.status
    }));
    res.json(bookedDates);
  } catch (error) {
    console.error('[getBookedDates] error:', error);
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

    const listings = await Listing.find({ userRef: hostId });
    const helpers = await Helper.find({ userRef: hostId });
    const services = await Service.find({ $or: [{ userRef: hostId }, { creator: hostId }] });
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
      // Return only fields the host dashboard renders. Populating a User
      // without a projection would expose private profile fields to the API.
      .populate({ path: 'listing', select: 'name title kind bedrooms imageUrls address regularPrice userRef totalUnits numberOfRooms numberOfApartments roomTypes', populate: { path: 'userRef', select: 'username avatar location' } })
      .populate({ path: 'helper', select: 'name title imageUrls address regularPrice userRef', populate: { path: 'userRef', select: 'username avatar location' } })
      .populate({ path: 'service', select: 'name title imageUrls address regularPrice price userRef creator', populate: [{ path: 'userRef', select: 'username avatar location' }, { path: 'creator', select: 'username avatar location' }] })
      .populate({ path: 'event', select: 'name title imageUrls address regularPrice userRef', populate: { path: 'userRef', select: 'username avatar location' } })
      .populate('user', 'username avatar location')
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

    let bookings;
    try {
      bookings = await Booking.find({ user: userId })
        .populate({ path: 'listing', select: 'name title kind bedrooms imageUrls address businessAddress location regularPrice userRef contact phone', populate: { path: 'userRef', select: 'username avatar phone' } })
        .populate({ path: 'helper', select: 'name title type imageUrls address businessAddress location regularPrice userRef contact phone', populate: { path: 'userRef', select: 'username avatar phone' } })
        .populate({ path: 'service', select: 'name title type imageUrls address businessAddress location price userRef creator contact phone', populate: [{ path: 'userRef', select: 'username avatar phone' }, { path: 'creator', select: 'username avatar phone' }] })
        .populate({ path: 'event', select: 'name title imageUrls address businessAddress location price userRef contact phone', populate: { path: 'userRef', select: 'username avatar phone' } })
        .populate('user', 'username avatar email phone')
        .sort({ createdAt: -1 })
        .lean();
    } catch (populateErr) {
      console.error('[BOOKINGS] Populate error, falling back to plain query:', populateErr.message);
      bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 }).lean();
    }

    const bookingIds = bookings.map((booking) => booking._id).filter(Boolean);
    const [listingReviews, helperReviews, serviceReviews, eventReviews] = await Promise.all([
      Comment.find({ bookingId: { $in: bookingIds } }).select('bookingId').lean(),
      HelperComment.find({ bookingId: { $in: bookingIds } }).select('bookingId').lean(),
      ServiceComment.find({ bookingId: { $in: bookingIds } }).select('bookingId').lean(),
      EventComment.find({ bookingId: { $in: bookingIds } }).select('bookingId').lean(),
    ]);
    const reviewedBookingIds = new Set([...listingReviews, ...helperReviews, ...serviceReviews, ...eventReviews].map((review) => String(review.bookingId)));

    return res.json(bookings.map((booking) => ({ ...booking, isReviewed: reviewedBookingIds.has(String(booking._id)) })));
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
      .populate({ path: 'service', populate: [{ path: 'userRef' }, { path: 'creator' }] })
      .populate('user', 'username email avatar phone')
      .populate({ path: 'event', populate: { path: 'userRef' } });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const item = booking.listing || booking.helper || booking.service || booking.event;
    const hostId = item?.userRef?._id?.toString() || item?.userRef?.toString() || item?.creator?._id?.toString() || item?.creator?.toString();
    const bookingUserId = booking.user?._id?.toString() || booking.user?.toString();
    const callerId = req.user.id;

    if (callerId !== hostId && callerId !== bookingUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isReviewed = booking.listing
      ? Boolean(await Comment.exists({ bookingId: booking._id }))
      : booking.helper
        ? Boolean(await HelperComment.exists({ bookingId: booking._id }))
        : booking.service
          ? Boolean(await ServiceComment.exists({ bookingId: booking._id }))
          : booking.event
            ? Boolean(await EventComment.exists({ bookingId: booking._id }))
            : false;
    res.json({ ...booking.toObject(), isReviewed });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const LIVE_LOCATION_BOOKING_STATUSES = ['confirmed', 'approved', 'assigned', 'enroute', 'ongoing'];
const LIVE_LOCATION_MAX_AGE_MS = 2 * 60 * 1000;

const getServiceBookingForLocation = async (bookingId) => Booking.findById(bookingId)
  .populate({ path: 'helper', select: 'userRef' })
  .populate({ path: 'service', select: 'userRef creator' })
  .populate({ path: 'user', select: '_id' });

const getLocationParticipantRole = (booking, userId) => {
  if (!booking || (!booking.helper && !booking.service)) return null;
  const serviceItem = booking.helper || booking.service;
  const providerId = serviceItem?.userRef?._id?.toString()
    || serviceItem?.userRef?.toString()
    || serviceItem?.creator?._id?.toString()
    || serviceItem?.creator?.toString();
  const customerId = booking.user?._id?.toString() || booking.user?.toString();
  if (String(userId) === providerId) return 'provider';
  if (String(userId) === customerId) return 'customer';
  return null;
};

// Live coordinates are available only to the customer and provider on an active service booking.
export const getProviderLocation = async (req, res) => {
  try {
    const booking = await getServiceBookingForLocation(req.params.bookingId);
    const role = getLocationParticipantRole(booking, req.user.id);
    if (!booking || !role) return res.status(404).json({ error: 'Booking not found' });

    if (!LIVE_LOCATION_BOOKING_STATUSES.includes(booking.status)) {
      await ProviderLiveLocation.deleteOne({ booking: booking._id });
      return res.json({ sharing: false, status: booking.status });
    }
    const location = await ProviderLiveLocation.findOne({ booking: booking._id }).lean();
    const isFresh = location?.expiresAt && new Date(location.expiresAt).getTime() > Date.now()
      && location.updatedAt && Date.now() - new Date(location.updatedAt).getTime() <= LIVE_LOCATION_MAX_AGE_MS;
    if (!location || !isFresh) {
      if (location) await ProviderLiveLocation.deleteOne({ _id: location._id });
      return res.json({ sharing: false, status: booking.status });
    }
    return res.json({
      sharing: true,
      status: booking.status,
      updatedAt: location.updatedAt,
      ...(role === 'customer' ? {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      } : {}),
    });
  } catch (error) {
    console.error('[getProviderLocation] error:', error.message);
    return res.status(500).json({ error: 'Unable to load live location' });
  }
};

// Only the provider on an accepted service booking can publish coordinates.
export const updateProviderLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body || {};
    const lat = Number(latitude);
    const lng = Number(longitude);
    const accuracyMeters = accuracy === undefined ? undefined : Number(accuracy);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'A valid latitude and longitude are required.' });
    }
    if (accuracyMeters !== undefined && (!Number.isFinite(accuracyMeters) || accuracyMeters < 0 || accuracyMeters > 100000)) {
      return res.status(400).json({ error: 'Invalid location accuracy.' });
    }

    const booking = await getServiceBookingForLocation(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Service booking not found.' });
    if (getLocationParticipantRole(booking, req.user.id) !== 'provider') {
      return res.status(403).json({ error: 'Only the service provider can share this location.' });
    }
    if (!LIVE_LOCATION_BOOKING_STATUSES.includes(booking.status)) {
      return res.status(409).json({ error: 'Location sharing is available only for an accepted, active booking.' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LIVE_LOCATION_MAX_AGE_MS);
    await ProviderLiveLocation.findOneAndUpdate(
      { booking: booking._id },
      { $set: {
      provider: req.user.id,
      customer: booking.user?._id || booking.user,
      latitude: lat,
      longitude: lng,
      accuracy: accuracyMeters,
      updatedAt: now,
      expiresAt,
      }, $setOnInsert: { booking: booking._id, startedAt: now } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ sharing: true, updatedAt: now });
  } catch (error) {
    console.error('[updateProviderLocation] error:', error.message);
    return res.status(500).json({ error: 'Unable to update live location' });
  }
};

// Providers can stop sharing at any time; clear coordinates immediately.
export const stopProviderLocation = async (req, res) => {
  try {
    const booking = await getServiceBookingForLocation(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Service booking not found.' });
    if (getLocationParticipantRole(booking, req.user.id) !== 'provider') {
      return res.status(403).json({ error: 'Only the service provider can stop this location share.' });
    }
    await ProviderLiveLocation.deleteOne({ booking: booking._id });
    return res.json({ sharing: false });
  } catch (error) {
    console.error('[stopProviderLocation] error:', error.message);
    return res.status(500).json({ error: 'Unable to stop live location sharing' });
  }
};

// Update booking status (requires authentication; only host or booking owner may update)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const cancellationReason = typeof req.body.cancellationReason === 'string'
      ? req.body.cancellationReason.trim().slice(0, 500)
      : '';

    const booking = await Booking.findById(bookingId)
      .populate({ path: 'listing', populate: { path: 'userRef' } })
      .populate({ path: 'helper', populate: { path: 'userRef' } })
      .populate({ path: 'service', populate: [{ path: 'userRef' }, { path: 'creator' }] })
      .populate({ path: 'event', populate: { path: 'userRef' } })
      .populate('user');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const item = booking.listing || booking.helper || booking.service || booking.event;
    const hostId = item?.userRef?._id?.toString() || item?.userRef?.toString() || item?.creator?._id?.toString() || item?.creator?.toString();
    const bookingUserId = booking.user?._id?.toString() || booking.user?.toString();
    const callerId = req.user.id;

    if (callerId !== hostId && callerId !== bookingUserId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isGuest = callerId === bookingUserId;
    const allowedByGuest = ['cancelled', 'completed'];
    const allowedByHost = ['confirmed', 'approved', 'declined', 'cancelled', 'assigned', 'enroute', 'ongoing', 'work_completed'];
    if (!req.user.isAdmin) {
      const allowedStatuses = isGuest ? allowedByGuest : allowedByHost;
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({ error: 'You are not allowed to set that booking status.' });
      }
    }

    const previousStatus = booking.status;
    if (status === 'cancelled' && !cancellationReason) {
      return res.status(400).json({ error: 'Please provide a reason for cancelling this booking.' });
    }
    if (status === 'work_completed' && (isGuest || !['confirmed', 'approved', 'assigned', 'enroute', 'ongoing'].includes(previousStatus))) {
      return res.status(409).json({ error: 'Only the provider can mark an active booking as work completed.' });
    }
    if (status === 'completed' && (!isGuest || previousStatus !== 'work_completed')) {
      return res.status(409).json({ error: 'The client can confirm completion only after the provider marks the work complete.' });
    }
    if (['confirmed', 'approved'].includes(status) && !isGuest && previousStatus !== 'pending') {
      return res.status(409).json({ error: 'Only pending bookings can be confirmed.' });
    }
    if (['assigned', 'enroute', 'ongoing'].includes(status) && (isGuest || !['confirmed', 'approved', 'assigned', 'enroute', 'ongoing'].includes(previousStatus))) {
      return res.status(409).json({ error: 'This booking cannot move to that service status.' });
    }
    // Guests may cancel only up to 48 hours before the scheduled start.
    // Providers can still cancel when they are unable to fulfil a booking.
    if (status === 'cancelled' && callerId === bookingUserId && !req.user.isAdmin) {
      const startsAt = new Date(booking.startDate);
      const cancellationDeadline = startsAt.getTime() - (48 * 60 * 60 * 1000);
      if (!Number.isFinite(startsAt.getTime()) || Date.now() > cancellationDeadline) {
        return res.status(409).json({ error: 'This booking can only be cancelled at least 48 hours before its scheduled start.' });
      }
      if (['cancelled', 'declined', 'completed', 'ongoing', 'work_completed'].includes(previousStatus)) {
        return res.status(409).json({ error: 'This booking can no longer be cancelled.' });
      }
    }
    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = cancellationReason;
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.user.isAdmin ? 'admin' : isGuest ? 'client' : 'provider';
    }
    await booking.save();
    if (['completed', 'cancelled', 'declined', 'work_completed'].includes(status)) {
      await ProviderLiveLocation.deleteOne({ booking: booking._id });
    }

    // If client closes and completes work, automatically release any held escrow to the provider
    if (status === 'completed' && isGuest && previousStatus === 'work_completed') {
      try {
        await Escrow.updateMany(
          { bookingId: booking._id, status: 'held' },
          { status: 'released', releasedAt: new Date() }
        );
      } catch (escrowErr) {
        console.error('[updateBookingStatus] Failed to release escrow:', escrowErr);
      }
    }
    if (booking.event && ['cancelled', 'declined'].includes(status) && !['cancelled', 'declined', 'completed'].includes(previousStatus)) {
      await Event.updateOne({ _id: booking.event }, { $inc: { ticketsBooked: -Math.max(1, Number(booking.numberOfGuests) || 1) } });
    }

    const itemName = item?.name || item?.title || 'Service';

    const itemType = booking.listing ? 'listing' : booking.helper ? 'helper' : booking.service ? 'service' : 'event';
    const itemId = booking.listing?._id || booking.listing || booking.helper?._id || booking.helper || booking.service?._id || booking.service || booking.event?._id || booking.event;

    // Notify relevant party of status change
    if (status !== previousStatus) {
      try {
        let recipientId;
        let title = 'Booking Update';
        const statusLabels = {
          pending: 'waiting for provider response', confirmed: 'confirmed', approved: 'confirmed',
          declined: 'declined', cancelled: 'cancelled', assigned: 'a provider has been assigned',
          enroute: 'the provider is on the way', ongoing: 'in progress', work_completed: 'finished by the provider', completed: 'completed'
        };
        let messageText = `Your booking for "${itemName}" is now ${statusLabels[status] || 'updated'}.`;

        if (status === 'cancelled') {
          title = 'Booking Cancelled';
          if (isGuest) {
            recipientId = hostId;
            messageText = `Client ${booking.user?.username || 'User'} cancelled their booking for "${itemName}". Reason: ${cancellationReason}`;
          } else {
            recipientId = bookingUserId;
            messageText = `Your booking for "${itemName}" was cancelled by the provider. Reason: ${cancellationReason}`;
          }
        } else if (status === 'confirmed' || status === 'approved') {
          title = '📅 Booking Confirmed';
          recipientId = bookingUserId;
          messageText = `Your appointment for "${itemName}" has been confirmed! View your schedule on the Calendar.`;

          // Also notify the service provider / host so both parties receive the calendar confirmation
          if (hostId && hostId.toString() !== bookingUserId?.toString() && await shouldSendBookingPush(hostId)) {
            try {
              await new Notification({
                userId: hostId,
                type: 'booking',
                title: '📅 Appointment Confirmed',
                message: `Appointment for "${itemName}" with ${booking.user?.username || 'client'} is confirmed on your Calendar schedule.`,
                data: { bookingId: booking._id, itemType, itemId, status: 'confirmed', price: booking.totalPrice, totalPrice: booking.totalPrice, isCalendar: true, link: '/calendar' }
              }).save();
            } catch (hostNotifErr) {
              console.error('Failed to notify host of calendar confirmation:', hostNotifErr);
            }
          }
        } else if (status === 'declined') {
          title = 'Booking Declined';
          recipientId = bookingUserId;
          messageText = `Your booking request for "${itemName}" was declined by the host.`;
        } else if (status === 'assigned') {
          title = 'Provider Assigned';
          recipientId = bookingUserId;
          messageText = `A provider has been assigned to your booking for "${itemName}".`;
        } else if (status === 'enroute') {
          title = '🚗 Provider En Route';
          recipientId = bookingUserId;
          messageText = `Your provider is en route to your location for "${itemName}".`;
        } else if (status === 'ongoing') {
          title = '🔨 Work In Progress';
          recipientId = bookingUserId;
          messageText = `Work has begun on your booking for "${itemName}".`;
        } else if (status === 'work_completed') {
          title = '✅ Work Completed by Provider';
          recipientId = bookingUserId;
          messageText = `The service provider has finished the work for "${itemName}". Please review and confirm completion to finalize payment and rate your pro!`;
        } else if (status === 'completed') {
          // If guest closed it, notify host of payment/completion
          if (callerId === bookingUserId) {
            if (hostId && await shouldSendBookingPush(hostId, 'activity.paymentReceipts')) {
              await new Notification({
                userId: hostId,
                type: 'booking',
                title: 'Work Closed & Payment Released',
                message: `Client ${booking.user?.username || 'User'} has closed the work for "${itemName}" and released the payment!`,
                data: { bookingId: booking._id, itemType, itemId, status: 'completed', price: booking.totalPrice, totalPrice: booking.totalPrice }
              }).save();
              sendPushNotificationToUser(hostId, {
                  title: 'Work Closed & Payment Released',
                  body: `Client ${booking.user?.username || 'User'} has closed the work for "${itemName}" and released payment!`,
                  data: { bookingId: String(booking._id), type: 'booking', route: '/notifications' },
                  preference: 'activity.paymentReceipts'
              }).catch((e) => console.warn('[updateBookingStatus] Host push error:', e.message));
            }
          }
          title = 'Booking Completed - Rate & Review';
          recipientId = bookingUserId;
          messageText = `Your booking for "${itemName}" is completed! Please leave a review to share your experience.`;
        } else {
          recipientId = bookingUserId;
        }

        if (recipientId && await shouldSendBookingPush(recipientId)) {
          await new Notification({
            userId: recipientId,
            type: status === 'completed' ? 'review' : 'booking',
            title,
            message: messageText,
            data: { bookingId: booking._id, itemType, itemId, status, price: booking.totalPrice, totalPrice: booking.totalPrice, canReview: status === 'completed' }
          }).save();

          sendPushNotificationToUser(recipientId, {
              title,
              body: messageText,
              data: { bookingId: String(booking._id), type: 'booking', route: '/notifications' }
          }).catch((e) => console.warn('[updateBookingStatus] Push error:', e.message));
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
        const normalize = (contact) => String(typeof contact === 'string' ? contact : contact?.phone || '').replace(/\D/g, '').slice(-9);
        userContactsSet = new Set(currentUser.contacts.map(normalize));
      }
    } catch (err) {
      // Ignore token decode errors — mutual contacts is optional
    }
  }

  return recentBookers.map(u => {
    let isMutual = false;
    if (hasContactsEnabled && u.phone) {
      const normalize = (p) => String(p || '').replace(/\D/g, '').slice(-9);
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
