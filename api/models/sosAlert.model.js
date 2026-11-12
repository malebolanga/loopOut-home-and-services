import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  alertCode: { type: String, required: true, unique: true, index: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  mapUrl: { type: String, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active', index: true },
  triggeredAt: { type: Date, default: Date.now, index: true },
  closedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), expires: 0 },
}, { timestamps: true });

export default mongoose.model('SOSAlert', sosAlertSchema);
