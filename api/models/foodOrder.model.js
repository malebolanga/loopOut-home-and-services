import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const foodOrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, index: true },
  customerId: { type: String, default: 'guest' },
  customerName: { type: String, default: 'Valued Customer' },
  customerPhone: { type: String, default: '' },
  shopId: { type: String, required: true },
  shopName: { type: String, required: true },
  shopImage: { type: String, default: '🍱' },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  fulfilment: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  deliveryAddress: { type: String, default: '' },
  deliveryNotes: { type: String, default: '' },
  orderComments: { type: String, default: '' },
  paymentMethod: { type: String, default: 'counter' },
  paymentStatus: { type: String, default: 'Pay at Counter / Cash' },
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Ready for Collection', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  completedAt: { type: Date },
  isRated: { type: Boolean, default: false },
  ratingDetails: {
    shopRating: Number,
    foodRating: Number,
    comment: String,
    createdAt: Date
  }
}, { timestamps: true });

const FoodOrder = mongoose.model('FoodOrder', foodOrderSchema);
export default FoodOrder;
