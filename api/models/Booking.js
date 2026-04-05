import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  helper: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'approved', 'declined'],
    default: 'pending'
  },
  phone: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);