import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Listing from '../api/models/listing.model.js';
import Helper from '../api/models/helper.model.js';
import Service from '../api/models/service.model.js';
import Event from '../api/models/event.model.js';

dotenv.config();
await mongoose.connect(process.env.MONGO);

const listings = await Listing.find({
  $or: [
    { address: { $regex: 'polokwane', $options: 'i' } },
    { near: { $regex: 'polokwane', $options: 'i' } }
  ]
}).select('name address near regularPrice');

const helpers = await Helper.find({
  $or: [
    { address: { $regex: 'polokwane', $options: 'i' } },
    { near: { $regex: 'polokwane', $options: 'i' } }
  ]
}).select('name type address near regularPrice');

console.log('Listings in Polokwane:', listings.length, listings.map(l => ({ name: l.name, address: l.address })));
console.log('Helpers in Polokwane:', helpers.length, helpers.map(h => ({ name: h.name, type: h.type, address: h.address })));

await mongoose.connection.close();
process.exit(0);
