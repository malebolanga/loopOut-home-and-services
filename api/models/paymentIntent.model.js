import mongoose from 'mongoose';

const paymentIntentSchema = new mongoose.Schema({
  purchaserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['listing', 'helper', 'service', 'event'], required: true },
  amount: { type: Number, required: true, min: 5 },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  payfastPaymentId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

export default mongoose.model('PaymentIntent', paymentIntentSchema);
