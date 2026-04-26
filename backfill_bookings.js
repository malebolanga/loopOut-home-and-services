import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function backfill() {
  await mongoose.connect(process.env.MONGO);
  console.log("Connected to MongoDB.");

  const Booking = (await import('./api/models/Booking.js')).default;
  const Listing = (await import('./api/models/listing.model.js')).default;
  const Helper = (await import('./api/models/helper.model.js')).default;
  const Service = (await import('./api/models/service.model.js')).default;

  // Initialize all to 0
  await Listing.updateMany({}, { $set: { bookingsCount: 0 } });
  await Helper.updateMany({}, { $set: { bookingsCount: 0 } });
  await Service.updateMany({}, { $set: { bookingsCount: 0 } });

  const bookings = await Booking.find();
  let count = 0;
  for (let b of bookings) {
      if (b.listing) { await Listing.findByIdAndUpdate(b.listing, { $inc: { bookingsCount: 1 } }); count++; }
      if (b.helper) { await Helper.findByIdAndUpdate(b.helper, { $inc: { bookingsCount: 1 } }); count++; }
      if (b.service) { await Service.findByIdAndUpdate(b.service, { $inc: { bookingsCount: 1 } }); count++; }
  }

  console.log(`Successfully mapped ${count} real bookings to their respective items.`);
  process.exit(0);
}

backfill();
