import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sell from '../api/models/sell.model.js';
import { getSellListingById } from '../api/controllers/sell.controller.js';

dotenv.config();

// Create mock Express request and response objects
const req = {
  params: {
    id: '6a1b650a9c6465c5984c1662',
  },
};

const res = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.jsonData = data;
    return this;
  },
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Testing getSellListingById with ID 6a1b650a9c6465c5984c1662:');
    await getSellListingById(req, res);
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', JSON.stringify(res.jsonData, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('ERROR:', error);
  }
}

run();
