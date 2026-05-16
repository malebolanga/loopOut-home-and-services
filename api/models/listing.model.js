import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    near: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    kind: {
      type: String,
      required: true,
    },
    period: { // Fixed typo from 'peroid' to 'period'
      type: String,
      required: false,
    },
    cancel: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    wifi: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    pool: {
      type: Boolean,
      required: true,
    },
    kitchen: {
      type: Boolean,
      required: true,
    },
    stove: {
      type: Boolean,
      required: true,
    },
    tv: {
      type: Boolean,
      required: true,
    },
    storage: {
      type: Boolean,
      required: true,
    },
    security: {
      type: Boolean,
      required: true,
    },
    hot: {
      type: Boolean,
      required: true, // Ensure it's required if needed
    },
    pets: {
      type: Boolean,
      required: true, // Ensure it's required if needed
    },
    prepaid: {
      type: Boolean,
      required: true, // Ensure it's required if needed
    },
    fridge: {
      type: Boolean,
      required: true, // Ensure it's required if needed
    },
    share: {
      type: Boolean,
      required: true, // Ensure it's required if needed
    },
    breakfast: {
      type: Boolean,
      required: true, // Ensure it's required if needed
    },
    party: {
      type: Boolean,
      required: true, // Ensure it's required if needed
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: [String], // Specify array of strings for better validation
      required: true,
    },
    videoUrl: {
      type: String,
      // Ensure it's required if needed
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId, // Assuming this refers to a user
      ref: 'User',
      required: true,
    },

    latitude: { 
      type: Number, 
      required: false
     },
    longitude: { 
      type: Number, 
      required: false
    },
    rating: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 5 
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }],

    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    
    isPromoted: {
      type: Boolean,
      default: false
    },
    promotionPackage: {
      type: String,
      enum: ['standard', 'premium', null],
      default: null
    },
    promotionExpiry: {
      type: Date
    },
    bookingsCount: { type: Number, default: 0 },
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
