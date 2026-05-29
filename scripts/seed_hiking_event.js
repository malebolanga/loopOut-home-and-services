// seed_hiking_event.js - script to create a sample hiking event
import mongoose from 'mongoose';
import Event from '../api/models/event.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loopout';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const sampleEvent = {
      userRef: new mongoose.Types.ObjectId(), // replace with a valid user ID
      name: 'Mountain Trail Hiking Adventure',
      description: 'Join us for a breathtaking hike through the mountains. All skill levels welcome.',
      near: 'Mountain Base Camp',
      address: '123 Mountain Road, Hilltown',
      contact: '+1234567890',
      host: 'John Doe',
      type: 'hiking',
      date: '2026-09-15',
      time: '08:00',
      regularPrice: 25,
      imageUrls: ['https://example.com/hiking1.jpg'],
      videoUrl: '',
      parking: true,
      foodAvailable: false,
      familyFriendly: true,
      operatingHours: {
        monday: { open: '08:00', close: '19:00', closed: false },
        tuesday: { open: '08:00', close: '19:00', closed: false },
        wednesday: { open: '08:00', close: '19:00', closed: false },
        thursday: { open: '08:00', close: '19:00', closed: false },
        friday: { open: '08:00', close: '19:00', closed: false },
        saturday: { open: '08:00', close: '19:00', closed: false },
        sunday: { open: '08:00', close: '19:00', closed: true }
      }
    };
    const event = await Event.create(sampleEvent);
    console.log('Created hiking event:', event._id);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding hiking event:', err);
    process.exit(1);
  }
}

seed();
