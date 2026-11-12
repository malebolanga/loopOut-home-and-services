import mongoose from 'mongoose';

const userSectionActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  section: { type: String, required: true, enum: ['Home', 'Search', 'Listings', 'Property', 'Services', 'Helpers', 'Food', 'Shops', 'Events', 'Bookings', 'Sell', 'Messages', 'Profile', 'Other'] },
  sessionId: { type: String, default: undefined },
  durationSeconds: { type: Number, min: 0, default: 0 },
  lastSeenAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
}, { versionKey: false });

userSectionActivitySchema.index({ userId: 1, createdAt: -1 });
userSectionActivitySchema.index({ userId: 1, sessionId: 1 }, { unique: true, partialFilterExpression: { sessionId: { $type: 'string' } } });

export default mongoose.model('UserSectionActivity', userSectionActivitySchema);
