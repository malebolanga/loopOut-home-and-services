import Event from '../models/event.model.js';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js'; // Add this import
import { createAreaNotifications } from '../utils/notificationUtils.js';

export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);

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
    const category = req.query.category;
    const location = req.query.location || req.query.address;

    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ],
      ...(category && { category }),
      ...(location && { location: { $regex: location, $options: 'i' } })
    };

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

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
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
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
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return next(errorHandler(404, 'Event not found'));
    res.status(200).json('Event has been deleted');
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
      .sort({ createdAt: -1 });

    res.status(200).json(similarEvents);
  } catch (error) {
    next(error);
  }
};

