import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['music', 'sports', 'art', 'community', 'food'],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrls: {
      type: [String],
      required: true,
      validate: {
        validator: (array) => array.length > 0,
        message: 'At least one image is required',
      },
    },
    videoUrl: {
      type: String,
      default: '',
    },
    parking: {
      type: Boolean,
      default: false,
    },
    foodAvailable: {
      type: Boolean,
      default: false,
    },
    familyFriendly: {
      type: Boolean,
      default: false,
    },

    rating: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 5 
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventComment'
    }],
    bookingsCount: {
      type: Number,
      default: 0
    },
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

const Event = mongoose.model('Event', eventSchema);
export default Event;