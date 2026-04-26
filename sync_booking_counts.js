import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './api/models/Booking.js';
import Listing from './api/models/listing.model.js';
import Helper from './api/models/helper.model.js';
import Service from './api/models/service.model.js';
import Event from './api/models/event.model.js';

dotenv.config();

const MONGO = process.env.MONGO || "mongodb+srv://Malebo_langa:malebo@loupeout-home.a9ccjpo.mongodb.net/?retryWrites=true&w=majority&appName=loupeOut-home";

async function syncCounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO);
    console.log('Connected!');

    // Sync Listings
    const listings = await Listing.find({});
    console.log(`Syncing ${listings.length} listings...`);
    for (const item of listings) {
      const count = await Booking.countDocuments({ listing: item._id });
      await Listing.findByIdAndUpdate(item._id, { bookingsCount: count });
    }

    // Sync Helpers
    const helpers = await Helper.find({});
    console.log(`Syncing ${helpers.length} helpers...`);
    for (const item of helpers) {
      const count = await Booking.countDocuments({ helper: item._id });
      await Helper.findByIdAndUpdate(item._id, { bookingsCount: count });
    }

    // Sync Services
    const services = await Service.find({});
    console.log(`Syncing ${services.length} services...`);
    for (const item of services) {
      const count = await Booking.countDocuments({ service: item._id });
      await Service.findByIdAndUpdate(item._id, { bookingsCount: count });
    }

    // Sync Events
    const events = await Event.find({});
    console.log(`Syncing ${events.length} events...`);
    for (const item of events) {
      const count = await Booking.countDocuments({ event: item._id });
      await Event.findByIdAndUpdate(item._id, { bookingsCount: count });
    }

    console.log('Sync complete!');
  } catch (error) {
    console.error('Error syncing counts:', error);
  } finally {
    mongoose.disconnect();
  }
}

syncCounts();
