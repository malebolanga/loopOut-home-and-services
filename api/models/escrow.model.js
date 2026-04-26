import mongoose from 'mongoose';

const escrowSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['held', 'released', 'refunded', 'disputed'],
    default: 'held'
  },
  paymentId: {
    type: String, // PayFast payment ID
    unique: true
  },
  mPaymentId: {
    type: String // My custom payment ID
  },
  releasedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  }
}, { timestamps: true });

const Escrow = mongoose.model('Escrow', escrowSchema);

export default Escrow;
