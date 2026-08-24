import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let database;

export const connectTestDatabase = async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';
  if (mongoose.connection.readyState === 1) return;
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
};

export const disconnectTestDatabase = async () => {
  await mongoose.disconnect();
  if (database) await database.stop();
  database = undefined;
};
