import mongoose from 'mongoose';

const shuttleBookingSchema = new mongoose.Schema(
  {
    shuttleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shuttle',
      required: true,
    },
    passengerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    passengerName: {
      type: String,
      required: true,
      trim: true,
    },
    passengerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    passengerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    seatNumbers: {
      type: [String],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // ── Luggage breakdown ───────────────────────────────────────
    // 1 standard bag per passenger is always free.
    // Passenger declares how many extra (paid) bags they are carrying.
    extraBagsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    luggageCharge: {
      type: Number,
      default: 0,  // = extraBagsCount × shuttle.extraBagPrice
      min: 0,
    },
    seatCharge: {
      type: Number,
      default: 0,  // = seatsBooked × shuttle.pricePerSeat
      min: 0,
    },
    pickupLocation: {
      type: String,
      default: '',
      trim: true,
    },
    pickupCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    dropoffLocation: {
      type: String,
      default: '',
      trim: true,
    },
    proximityAlertSent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'paid', 'declined', 'cancelled', 'completed'],
      default: 'pending_approval',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    paymentDeadline: {
      type: Date,
      default: null, // Set to approvedAt + 24h when driver approves
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'LoopPay / Card / Cash on Boarding',
    },
    ticketCode: {
      type: String,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    declineReason: {
      type: String,
      default: '',
      trim: true,
    },
    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralHistory: [{
      fromDriverRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      toDriverRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      fromShuttleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle' },
      toShuttleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle' },
      referredAt: { type: Date, default: Date.now },
    }],
    passengerNotes: {
      type: String,
      default: '',
      trim: true,
    },
    // ── Passenger Rating (after trip completed) ─────────────────
    passengerRating: {
      type: Number,
      default: null,  // null = not yet rated
      min: 1,
      max: 5,
    },
    passengerReview: {
      type: String,
      default: '',
      trim: true,
      maxlength: 400,
    },
    ratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

shuttleBookingSchema.index({ shuttleRef: 1, status: 1 });
shuttleBookingSchema.index({ passengerRef: 1, createdAt: -1 });
shuttleBookingSchema.index({ driverRef: 1, createdAt: -1 });
shuttleBookingSchema.index({ ticketCode: 1 });

const ShuttleBooking = mongoose.models.ShuttleBooking || mongoose.model('ShuttleBooking', shuttleBookingSchema);
export default ShuttleBooking;
