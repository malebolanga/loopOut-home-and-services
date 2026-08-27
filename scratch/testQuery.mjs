import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Listing from '../api/models/listing.model.js';
import Helper from '../api/models/helper.model.js';
import Service from '../api/models/service.model.js';
import Event from '../api/models/event.model.js';

dotenv.config();
await mongoose.connect(process.env.MONGO);

const listingFilter = { $and: [ { $or: [ { address: { $regex: 'polokwane', $options: 'i' } }, { near: { $regex: 'polokwane', $options: 'i' } } ] } ] };

console.log('Testing listing query with filter:', JSON.stringify(listingFilter));
try {
  const listings = await Listing.find(listingFilter).sort({ isPromoted: -1, rating: -1, createdAt: -1 }).limit(8).lean();
  console.log('Listings found:', listings.length);
} catch (e) {
  console.error('Listing find error:', e);
}

try {
  const helpers = await Helper.find(listingFilter).sort({ rating: -1, createdAt: -1 }).limit(8).lean();
  console.log('Helpers found:', helpers.length);
} catch (e) {
  console.error('Helper find error:', e);
}

await mongoose.connection.close();
process.exit(0);
