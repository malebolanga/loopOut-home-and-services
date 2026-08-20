import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    near: { type: String, required: true },
    rules: { type: String, required: false },
    address: { type: String, required: true },
    contact: { type: Number, required: true },
    host: { type: String, required: true },
    kind: { type: String, required: true },
    period: { type: String, required: false }, // fixed typo
    cancel: { type: String, required: true },
    regularPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    furnished: { type: Boolean, required: true },
    wifi: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    pool: { type: Boolean, required: true },
    kitchen: { type: Boolean, required: true },
    stove: { type: Boolean, required: true },
    tv: { type: Boolean, required: true },
    storage: { type: Boolean, required: true },
    security: { type: Boolean, required: true },
    hot: { type: Boolean, required: true },
    pets: { type: Boolean, required: true },
    prepaid: { type: Boolean, required: true },
    fridge: { type: Boolean, required: true },
    share: { type: Boolean, required: true },
    breakfast: { type: Boolean, required: true },
    party: { type: Boolean, required: true },
    instantConfirmation: { type: Boolean, default: false },
    kidFriendly: { type: Boolean, default: false },
    wheelchairAccessible: { type: Boolean, default: false },
    parkingAvailable: { type: Boolean, default: false },
    environmentallyFriendly: { type: Boolean, default: false },
    type: { type: String, required: true },
    offer: { type: Boolean, required: true },
    imageUrls: { type: [String], required: true },
    videoUrl: { type: String },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    isPromoted: { type: Boolean, default: false },
    promotionPackage: { type: String, enum: ['standard', 'premium'], default: null },
    bookingsCount: { type: Number, default: 0 },
    bookAuthor: { type: String, required: false },
    bookYear: { type: String, required: false },
    bookUsageHistory: { type: String, required: false },
    numberOfUsed: { type: Number, required: false },
    checkInTime: { type: String, required: false, default: '14:00' },
    checkOutTime: { type: String, required: false, default: '11:00' },
    numberOfApartments: { type: Number, default: 0 },
    numberOfRooms: { type: Number, default: 1 },
    totalUnits: { type: Number, default: 1 },
    roomTypes: [
      {
        name: { type: String },
        count: { type: Number, default: 1 },
        price: { type: Number },
        capacity: { type: Number },
        description: { type: String },
        image: { type: String },
        imageUrls: { type: [String], default: [] }
      }
    ],
    operatingHours: {
      monday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
      tuesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
      wednesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
      thursday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
      friday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
      saturday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
      sunday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: true } }
    }
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
