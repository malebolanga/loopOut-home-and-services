import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sell from '../api/models/sell.model.js';
import User from '../api/models/user.model.js'; // Import User model to avoid population errors

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const sellItems = await Sell.find({}).populate('creator', 'username');
    console.log(`Found ${sellItems.length} sell items:`);
    for (const item of sellItems) {
      console.log(`- ID: ${item._id}, Title: ${item.title}, Category: ${item.category}, Creator: ${item.creator?.username}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('ERROR:', error);
  }
}

run();
