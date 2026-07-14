import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/models/user.model.js';

dotenv.config();

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO);
    console.log('Connected.');

    const allUsers = await User.find().lean();
    console.log(`Total users in collection: ${allUsers.length}`);

    let nonObjectIdCount = 0;
    for (const u of allUsers) {
      const isObjectId = mongoose.Types.ObjectId.isValid(u._id);
      console.log(`User ID: ${u._id} (${typeof u._id}) - Valid ObjectId? ${isObjectId} - Username: ${u.username}`);
      if (!isObjectId) {
        nonObjectIdCount++;
      }
    }
    console.log(`\nFound ${nonObjectIdCount} users with non-ObjectId IDs.`);
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
