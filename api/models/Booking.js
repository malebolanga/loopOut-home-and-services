import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  helper: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'approved', 'declined', 'assigned', 'enroute', 'ongoing'],
    default: 'pending'
  },
  phone: { type: String },
  message: { type: String },
  subtype: { type: String },
  selectedPerformer: { type: String },
  performerExperience: { type: String },
  performerImage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);