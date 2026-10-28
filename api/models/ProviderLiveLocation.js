import mongoose from 'mongoose';

const providerLiveLocationSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  accuracy: { type: Number, min: 0 },
  startedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: false });

export default mongoose.model('ProviderLiveLocation', providerLiveLocationSchema);
