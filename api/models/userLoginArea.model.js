import mongoose from 'mongoose';

const userLoginAreaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  capturedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { versionKey: false });

export default mongoose.model('UserLoginArea', userLoginAreaSchema);
