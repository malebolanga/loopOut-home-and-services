import mongoose from 'mongoose';

const tableBookingSchema = new mongoose.Schema({
  customerId: { type: String, default: 'guest' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  shopId: { type: String, required: true },
  shopName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: String, default: '2' },
  status: { type: String, default: 'Confirmed' }
}, { timestamps: true });

const TableBooking = mongoose.model('TableBooking', tableBookingSchema);
export default TableBooking;
