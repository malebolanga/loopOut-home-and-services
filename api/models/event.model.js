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

    comments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventComment'
    },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;