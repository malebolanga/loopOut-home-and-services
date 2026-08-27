import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO;
console.log('MONGO env found:', !!uri);
console.log('MONGO value (first 40 chars):', uri ? uri.substring(0, 40) : 'UNDEFINED');
console.log('MONGO starts with mongodb+srv:', uri ? uri.startsWith('mongodb+srv') : false);

if (!uri) {
  console.error('ERROR: MONGO is not set!');
  process.exit(1);
}

console.log('\nAttempting MongoDB connection...');
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('SUCCESS: MongoDB connected!');
  console.log('Connection state:', mongoose.connection.readyState);
  await mongoose.connection.close();
} catch (err) {
  console.error('FAILED to connect:', err.message);
}
process.exit(0);
