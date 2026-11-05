import Booking from '../models/Booking.js';
﻿import Event from '../models/event.model.js';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js'; // Add this import
import { createAreaNotifications } from '../utils/notificationUtils.js';
import { validateListingText, validateImages } from '../utils/moderationHelper.js';

export const createEvent = async (req, res, next) => {
  try {

    const imageCheck = await validateImages(req.body.imageUrls);
    if (!imageCheck.valid) {
      return next(errorHandler(400, imageCheck.message));
    }

    const capacity = Number(req.body.capacity);
    const eventData = { ...req.body, userRef: req.user.id, ticketsBooked: 0 };
    if (Number.isInteger(capacity) && capacity > 0) eventData.capacity = capacity;
    else delete eventData.capacity;
    const event = await Event.create(eventData);

    // Add event to user's events array
    await User.findByIdAndUpdate(req.body.userRef, {
      $push: { events: event._id }
    });

    // Create notifications for users in the area
    createAreaNotifications(event, 'event');

    return res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const searchTerm = req.query.searchTerm || '';
    const category = req.query.category || req.query.type;
    const location = req.query.location || req.query.address;
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const price = {};
    if (Number.isFinite(minPrice)) price.$gte = minPrice;
    if (Number.isFinite(maxPrice)) price.$lte = maxPrice;

    const query = {
      ...(category && { type: category }),
      ...(location && { address: { $regex: location, $options: 'i' } }),
      ...(Object.keys(price).length && { regularPrice: price })
    };

    if (searchTerm && searchTerm.trim() !== '') {
      query.$or = [
        { name: { $regex: searchTerm.trim(), $options: 'i' } },
        { description: { $regex: searchTerm.trim(), $options: 'i' } },
        { address: { $regex: searchTerm.trim(), $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate('userRef', 'username avatar');

    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('userRef');
    if (!event) return next(errorHandler(404, 'Event not found'));
    res.status(200).json(event);

  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {

    if (req.body.imageUrls) {
      const imageCheck = await validateImages(req.body.imageUrls);
      if (!imageCheck.valid) {
        return next(errorHandler(400, imageCheck.message));
      }
    }

    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) return next(errorHandler(404, 'Event not found'));
    const ownerId = (existingEvent.userRef?._id || existingEvent.userRef)?.toString();
    if (ownerId !== req.user?.id && !req.user?.isAdmin) return next(errorHandler(403, 'You can only update your own events.'));
    const capacity = Number(req.body.capacity);
    if (req.body.capacity !== undefined && req.body.capacity !== '' && (!Number.isInteger(capacity) || capacity < Number(existingEvent.ticketsBooked || 0))) {
      return next(errorHandler(400, 'Event capacity cannot be lower than tickets already reserved.'));
    }
    const updateData = { ...req.body };
    delete updateData.ticketsBooked;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!event) return next(errorHandler(404, 'Event not found'));
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return next(errorHandler(404, 'Event not found'));

    const ownerId = (event.userRef?._id || event.userRef)?.toString();
    if (req.user?.id !== ownerId && !req.user?.isAdmin) {
      return next(errorHandler(403, 'You can only delete your own events!'));
    }

    const activeBookingCount = await Booking.countDocuments({
      event: event._id,
      status: { $in: ['pending', 'confirmed', 'approved', 'assigned', 'enroute', 'ongoing', 'work_completed'] },
      endDate: { $gte: new Date() }
    });
    if (activeBookingCount > 0) {
      return next(errorHandler(409, 'This event has active attendee registrations. Cancel or conclude them before deleting the event.'));
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Event has been deleted' });
  } catch (error) {
    next(error);
  }
};

// Get Similar Events
export const getSimilarEvents = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(errorHandler(404, 'Event not found!'));
    }

    const similarEvents = await Event.find({
      _id: { $ne: req.params.id },
      type: event.type,
    })
      .limit(4)
      .sort({ createdAt: -1 })
      .populate('userRef', 'username avatar');

    res.status(200).json(similarEvents);
  } catch (error) {
    next(error);
  }
};

