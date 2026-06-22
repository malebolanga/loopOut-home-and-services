import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/models/user.model.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    // 1. Update Thami Kalo (ID: 680e8961f20d3641216b886d) phone number
    await User.findByIdAndUpdate('680e8961f20d3641216b886d', {
      phone: '+27712345678'
    });
    console.log('Updated Thami Kalo phone number to +27712345678');

    // 2. Update Thabonki Langa (ID: 685c32ebe0208fafb155d344) phone number
    await User.findByIdAndUpdate('685c32ebe0208fafb155d344', {
      phone: '+27612345679'
    });
    console.log('Updated Thabonki Langa phone number to +27612345679');

    // 3. Update existing users with mock contacts to also include Malebo T's phone (0794478189)
    await User.updateMany(
      { accessContacts: true },
      { $addToSet: { contacts: '+27794478189' } }
    );
    console.log('Added Malebo T phone (+27794478189) to all accessContacts users');

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error seeding DB:', error);
  }
}

run();
