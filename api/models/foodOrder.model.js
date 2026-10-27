import mongoose from 'mongoose';

const itemRatingSchema = new mongoose.Schema({
  itemIndex: Number,
  mealId: String,
  mealName: String,
  rating: { type: Number, min: 1, max: 5 }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String, default: '🍱' },
  sides: { type: [String], default: [] }
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
  scheduledFor: { type: Date },
  orderComments: { type: String, default: '' },
  paymentMethod: { type: String, default: 'counter' },
  paymentStatus: { type: String, default: 'Pay at Counter / Cash' },
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Ready for Collection', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  pickupReadyAt: { type: Date },
  completedAt: { type: Date },
  completionMethod: { type: String, enum: ['customer', 'auto_timeout'], default: undefined },
  isRated: { type: Boolean, default: false },
  ratingDetails: {
    shopRating: Number,
    foodRating: Number,
    itemRatings: { type: [itemRatingSchema], default: [] },
    comment: String,
    createdAt: Date
  }
}, { timestamps: true });

foodOrderSchema.index({ status: 1, fulfilment: 1, pickupReadyAt: 1 });

const FoodOrder = mongoose.model('FoodOrder', foodOrderSchema);
export default FoodOrder;
