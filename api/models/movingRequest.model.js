import mongoose from 'mongoose';

const movingRequestSchema = new mongoose.Schema({
  vehicleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'MovingVehicle', required: true, index: true },
  requesterRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  driverRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requesterName: { type: String, required: true, trim: true },
  requesterPhone: { type: String, required: true, trim: true },
  pickupAddress: { type: String, required: true, trim: true, maxlength: 300 },
  pickupCoordinates: { lat: { type: Number, min: -90, max: 90 }, lng: { type: Number, min: -180, max: 180 } },
  dropoffAddress: { type: String, required: true, trim: true, maxlength: 300 },
  itemDescription: { type: String, required: true, trim: true, maxlength: 1000 },
  requestedAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'service_completed', 'payment_reported', 'paid', 'completed', 'cancelled'], default: 'pending', index: true },
  quoteAmount: { type: Number, min: 0, default: null },
  quoteStatus: { type: String, enum: ['not_proposed', 'pending', 'accepted', 'declined'], default: 'not_proposed', index: true },
  quoteProposedAt: { type: Date, default: null },
  quoteRespondedAt: { type: Date, default: null },
  finalPrice: { type: Number, min: 0, default: null },
  serviceCompletedAt: { type: Date, default: null },
  paymentMethod: { type: String, enum: ['cash', 'eft'], default: null },
  paymentReportedAt: { type: Date, default: null },
  paymentConfirmedAt: { type: Date, default: null },
}, { timestamps: true });

const MovingRequest = mongoose.models.MovingRequest || mongoose.model('MovingRequest', movingRequestSchema);
export default MovingRequest;
