import mongoose from 'mongoose';

const movingVehicleSchema = new mongoose.Schema({
  driverRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  driverName: { type: String, required: true, trim: true },
  driverPhone: { type: String, required: true, trim: true },
  driverDisplayName: { type: String, required: true, trim: true },
  vehicleType: { type: String, enum: ['truck', 'minivan'], required: true },
  vehicleDescription: { type: String, required: true, trim: true, maxlength: 160 },
  carColor: { type: String, required: true, trim: true, maxlength: 40 },
  vehicleImageUrl: { type: String, required: true, trim: true },
  driverPhotoUrl: { type: String, required: true, trim: true },
  plateNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 24 },
  vehicleLicenceDocumentUrl: { type: String, required: true, trim: true },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  verificationSubmittedAt: { type: Date, default: Date.now },
  verificationReviewedAt: { type: Date, default: null },
  verificationReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verificationReviewNote: { type: String, trim: true, maxlength: 500, default: '' },
  verificationChecks: {
    plateMatchesDocument: { type: Boolean, default: false },
    driverMatchesApprovedAccount: { type: Boolean, default: false },
    vehicleDetailsMatch: { type: Boolean, default: false },
    vehiclePhotoMatchesDetails: { type: Boolean, default: false },
  },
  hourlyRate: { type: Number, required: true, min: 1 },
  callOutFee: { type: Number, default: 0, min: 0 },
  description: { type: String, trim: true, maxlength: 800, default: '' },
  currentCoordinates: {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    address: { type: String, trim: true, default: '' },
    accuracy: { type: Number, default: null },
    isLive: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  serviceRadiusKm: { type: Number, default: 50, min: 1, max: 50 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const MovingVehicle = mongoose.models.MovingVehicle || mongoose.model('MovingVehicle', movingVehicleSchema);
export default MovingVehicle;
