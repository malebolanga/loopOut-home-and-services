import mongoose from 'mongoose';

const bookingSlotLockSchema = new mongoose.Schema({
  resourceType: { type: String, enum: ['helper', 'service'], required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  minute: { type: Date, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

// A unique minute key serializes overlapping helper/service bookings across
// API instances. One-minute buckets keep the lock granularity aligned with
// the time precision offered by the booking forms.
bookingSlotLockSchema.index({ resourceType: 1, resourceId: 1, minute: 1 }, { unique: true });
bookingSlotLockSchema.index({ bookingId: 1 });
bookingSlotLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('BookingSlotLock', bookingSlotLockSchema);
