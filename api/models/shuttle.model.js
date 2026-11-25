import mongoose from 'mongoose';

const shuttleSchema = new mongoose.Schema(
  {
    driverRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverPhone: {
      type: String,
      trim: true,
      default: '',
    },
    driverAvatar: {
      type: String,
      default: '',
    },
    // ── Driver Verification Scans (Licence & ID Document) ──────
    driverLicenceScan: {
      type: String,
      default: '',
      trim: true,
    },
    driverIdScan: {
      type: String,
      default: '',
      trim: true,
    },
    driverFaceScan: {
      type: String,
      default: '',
      trim: true,
    },
    driverLicenceNumber: {
      type: String,
      default: '',
      trim: true,
    },
    driverVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    // ── Driver Banking Details (For direct passenger EFT payments) ──
    bankAccountHolder: {
      type: String,
      default: '',
      trim: true,
    },
    bankName: {
      type: String,
      default: '',
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      default: '',
      trim: true,
    },
    bankBranchCode: {
      type: String,
      default: '',
      trim: true,
    },
    bankAccountType: {
      type: String,
      default: 'Savings',
      trim: true,
    },
    bankReference: {
      type: String,
      default: '',
      trim: true,
    },
    // ── Driver Stats (auto-updated from bookings) ───────────────
    driverRating: {
      type: Number,
      default: 0,       // 0 means no ratings yet
      min: 0,
      max: 5,
    },
    driverRatingCount: {
      type: Number,
      default: 0,       // total number of ratings received
      min: 0,
    },
    completedTrips: {
      type: Number,
      default: 0,       // total paid/completed bookings handled
      min: 0,
    },
    carType: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Toyota Quantum 15-Seater", "Mercedes-Benz Sprinter 22-Seater", "Toyota Rumion 7-Seater"
    },
    plateNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // e.g. "CA 123-456", "DZ 88 YK GP"
    },
    carColor: {
      type: String,
      required: true,
      trim: true,
      default: 'White',
    },
    carImages: {
      type: [String],
      default: [],
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 65,
      default: 15,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      default: 15,
    },
    reservedSeatNumbers: {
      type: [String],
      default: [],
    },
    serviceType: {
      type: String,
      enum: ['interprovincial', 'local'],
      default: 'interprovincial',
    },
    departureProvince: {
      type: String,
      default: 'Gauteng',
      trim: true,
    },
    destinationProvince: {
      type: String,
      default: 'Limpopo',
      trim: true,
    },
    originCity: {
      type: String,
      required: true,
      trim: true,
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true,
    },
    originCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    destinationCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    pickupStation: {
      type: String,
      default: 'Main Station / Central Rank',
      trim: true,
    },
    dropoffStation: {
      type: String,
      default: 'House-to-House Dropoff (Direct to door / gate)',
      trim: true,
    },
    // ── Dropoff type: House to House vs Station ─────────────────
    dropoffType: {
      type: String,
      enum: ['house_to_house', 'station', 'flexible'],
      default: 'house_to_house',
    },
    isHouseToHouse: {
      type: Boolean,
      default: true,
    },
    // ── Flexible departure rule: leaves when full / almost full ─
    departureRule: {
      type: String,
      enum: ['when_full', 'scheduled', 'flexible'],
      default: 'when_full',
    },
    leavesWhenFull: {
      type: Boolean,
      default: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
      trim: true,
      default: 'Leaves when full / almost full',
    },
    estimatedArrival: {
      type: String,
      default: '',
      trim: true,
    },
    pricePerSeat: {
      type: Number,
      required: true,
      min: 0,
      default: 200,
    },
    // ── Luggage Policy ──────────────────────────────────────────
    // 1 standard hand/cabin bag is always FREE per passenger.
    // A "standard bag" is defined as a soft bag ≤ 20 kg.
    // Any additional bag or oversized item (suitcase, gas cylinder, etc.)
    // incurs the extra-bag fee below.
    freeBagsPerPassenger: {
      type: Number,
      default: 1, // 1 normal bag free
    },
    extraBagPrice: {
      type: Number,
      default: 0,  // 0 means driver charges on-day — set to a value to show it upfront
      min: 0,
    },
    maxExtraBagsPerPassenger: {
      type: Number,
      default: 2, // Maximum additional paid bags allowed per passenger
      min: 0,
    },
    luggageNotes: {
      type: String,
      default: '1 standard bag free. Extra bags / suitcases charged separately.',
      trim: true,
    },
    currentStatus: {
      type: String,
      enum: ['scheduled', 'boarding', 'en_route', 'arrived', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    // Set only after real trip completion so passengers receive one arrival notice.
    tripCompletionNotifiedAt: {
      type: Date,
      default: null,
    },
    departedAt: { type: Date, default: null },
    arrivedAt: { type: Date, default: null },
    returnRouteFor: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle' },
    returnRouteRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle', default: null },
    currentCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' },
      accuracy: { type: Number, default: null },
      isLive: { type: Boolean, default: false },
      updatedAt: { type: Date, default: Date.now },
    },
    features: {
      type: [String],
      default: ['Air Conditioning', 'Luggage Space', 'USB Charging Ports'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

shuttleSchema.index({ serviceType: 1, departureProvince: 1, destinationProvince: 1, departureDate: 1 });
shuttleSchema.index({ originCity: 1, destinationCity: 1 });
shuttleSchema.index({ driverRef: 1 });
shuttleSchema.index({ active: 1, currentStatus: 1 });
shuttleSchema.index({ returnRouteFor: 1 }, { unique: true, sparse: true });

const Shuttle = mongoose.models.Shuttle || mongoose.model('Shuttle', shuttleSchema);
export default Shuttle;
