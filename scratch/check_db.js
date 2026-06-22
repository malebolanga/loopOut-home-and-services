import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/models/user.model.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    const users = await User.find({}, { username: 1, phone: 1, location: 1, contacts: 1, accessContacts: 1 });
    console.log('\n--- USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id} | User: ${u.username} | Phone: ${u.phone} | AccessContacts: ${u.accessContacts} | Contacts: ${JSON.stringify(u.contacts)}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error checking DB:', error);
  }
}

check();
