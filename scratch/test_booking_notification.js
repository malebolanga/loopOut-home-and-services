import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../api/models/notification.model.js';
import Booking from '../api/models/Booking.js';
import Helper from '../api/models/helper.model.js';
import Service from '../api/models/service.model.js';

dotenv.config();

async function testBookingNotification() {
  await mongoose.connect(process.env.MONGO);
  console.log('✅ Connected to MongoDB');

  // Find a helper or service
  const helper = await Helper.findOne();
  if (helper) {
    console.log(`Found helper: ${helper.name} (${helper._id}) owned by: ${helper.userRef}`);
  }

  const service = await Service.findOne();
  if (service) {
    console.log(`Found service: ${service.name} (${service._id}) owned by: ${service.userRef}`);
  }

  // Check recent notifications
  const recentNotifs = await Notification.find().sort({ createdAt: -1 }).limit(5);
  console.log(`Recent notifications count: ${recentNotifs.length}`);
  recentNotifs.forEach(n => {
    console.log(` - [${n.type}] "${n.title}": ${n.message} (Data: ${JSON.stringify(n.data)})`);
  });

  await mongoose.disconnect();
  console.log('🔌 Disconnected');
}

testBookingNotification().catch(console.error);
