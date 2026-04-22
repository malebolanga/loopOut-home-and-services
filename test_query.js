import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LookingFor from './api/models/lookingFor.model.js';

dotenv.config();

async function testQuery() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    const lookingFors = await LookingFor.find({
      active: { $in: [false, true] },
      category: { $in: ['room', 'nanny', 'dog', 'roommate', 'other', 'sharing', 'place', 'pampering', 'household', 'others'] },
    })
    .limit(6);

    console.log('Found:', lookingFors.length);
    console.log('Sample:', JSON.stringify(lookingFors[0], null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('ERROR:', error);
  }
}

testQuery();
