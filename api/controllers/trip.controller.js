import Trip from '../models/trip.model.js';
import Event from '../models/event.model.js';
import Helper from '../models/helper.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';
import mongoose from 'mongoose';

export const createTrip = async (req, res, next) => {
  try {
    const tripData = req.body;
    
    // Validate required fields
    if (!tripData.userRef || !tripData.name || !tripData.destination) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    // Convert string IDs to ObjectIds
    tripData.stops = tripData.stops.map(stop => ({
      ...stop,
      events: stop.events.map(id => new mongoose.Types.ObjectId(id)),
      helpers: stop.helpers.map(id => new mongoose.Types.ObjectId(id)),
      listings: stop.listings.map(id => new mongoose.Types.ObjectId(id))
    }));

    const newTrip = new Trip(tripData);
    await newTrip.save();
    
    res.status(201).json({
      success: true,
      trip: newTrip
    });
  } catch (error) {
    next(error);
  }
};

export const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate({
        path: 'stops.events',
        model: 'Event'
      })
      .populate({
        path: 'stops.helpers',
        model: 'Helper'
      })
      .populate({
        path: 'stops.listings',
        model: 'Listing'
      });
    
    if (!trip) {
      return next(errorHandler(404, 'Trip not found'));
    }
    
    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};

export const searchForStop = async (req, res, next) => {
  try {
    const { location, date } = req.query;
    
    if (!location || !date) {
      return next(errorHandler(400, 'Location and date are required'));
    }
    
    // Format date to match event model (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Query events
    const events = await Event.find({
      $or: [
        { address: { $regex: location, $options: 'i' } },
        { near: { $regex: location, $options: 'i' } }
      ],
      date: formattedDate
    }).limit(4);
    
    // Query helpers
    const helpers = await Helper.find({
      $or: [
        { address: { $regex: location, $options: 'i' } },
        { near: { $regex: location, $options: 'i' } }
      ]
    }).limit(4);
    
    // Query listings
    const listings = await Listing.find({
      $or: [
        { address: { $regex: location, $options: 'i' } },
        { near: { $regex: location, $options: 'i' } }
      ]
    }).limit(4);
    
    res.json({
      success: true,
      events,
      helpers,
      listings
    });
    
  } catch (error) {
    next(error);
  }
};


