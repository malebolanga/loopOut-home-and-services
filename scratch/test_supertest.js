import request from 'supertest';
import mongoose from 'mongoose';
import app from '../api/index.js';

async function run() {
  try {
    // Wait for mongoose connection in app (it connects asynchronously, but we can query immediately since mongoose queues operations)
    console.log('Sending request to /api/sell/6a1b650a9c6465c5984c1662...');
    const res = await request(app)
      .get('/api/sell/6a1b650a9c6465c5984c1662')
      .expect(200); // Expect success if it works, or let it fail and print the body

    console.log('Response Status:', res.status);
    console.log('Response Body:', JSON.stringify(res.body, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('ERROR:', error);
    await mongoose.disconnect();
  }
}

run();
