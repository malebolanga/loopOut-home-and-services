import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testMongoConnection() {
  const uri = process.env.MONGO;

  if (!uri) {
    console.error('❌ MONGO environment variable is not set.');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   DB:   ${mongoose.connection.name}`);

    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('   No collections found in database.');
    } else {
      console.log(`   Collections (${collections.length}):`);
      collections.forEach(col => console.log(`     - ${col.name}`));
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(`   ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

testMongoConnection();
