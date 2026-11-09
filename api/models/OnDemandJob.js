import mongoose from 'mongoose';

const onDemandJobSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceType: { type: String, required: true, trim: true, lowercase: true, index: true },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  scheduledFor: { type: Date, required: true },
  budget: { type: Number, min: 0, default: 0 },
  radiusKm: { type: Number, min: 1, max: 50, default: 15 },
  offeredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  declinedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['searching', 'accepted', 'enroute', 'ongoing', 'completed', 'cancelled', 'unmatched'], default: 'searching', index: true },
}, { timestamps: true });

onDemandJobSchema.index({ customer: 1, createdAt: -1 });
onDemandJobSchema.index({ offeredTo: 1, status: 1, createdAt: -1 });

export default mongoose.model('OnDemandJob', onDemandJobSchema);
