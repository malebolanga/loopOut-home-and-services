import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  tag: { type: String, default: 'Popular' },
  image: { type: String, default: '🍱' }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userName: { type: String, default: 'Customer' },
  shopRating: { type: Number, default: 5 },
  foodRating: { type: Number, default: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, default: 'General' },
  distance: { type: String, default: '1.0 km' },
  time: { type: String, default: '20–30 min' },
  rating: { type: String, default: '5.0' },
  ratingsCount: { type: Number, default: 1 },
  image: { type: String, default: '🏪' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  ownerId: { type: String, default: 'guest' },
  ownerName: { type: String, default: 'Store Manager' },
  // Pauses orders while keeping the shop and menu visible to customers.
  isOpen: { type: Boolean, default: true },
  whatsapp: { type: String, default: '' },
  operatingHours: {
    openTime: { type: String, default: '08:00' },
    closeTime: { type: String, default: '20:00' },
    days: { type: [String], default: () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }
  },
  meals: [mealSchema],
  reviews: [reviewSchema]
}, { timestamps: true });

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;
