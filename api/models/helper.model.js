import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema(
  {
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
      required: true,
      enum: ['domestic', 'errand', 'tutor', 'chef', 'beauty', 'tattoo', 'barber'],
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    kind: {
      type: String,
    },
    period: {
      type: String,
    },
    cancel: {
      type: String,
    },
    security: {
      type: Boolean,
      default: false,
    },
    pets: {
      type: Boolean,
      default: false,
    },
    bedrooms: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    // New fields for barber
    specializations: {
      type: String,
    },
    equipment: {
      type: String,
    },
    travelFee: {
      type: Number,
    },
    bookingNotice: {
      type: String,
    },
    additionalPricing: {
      type: String,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    comments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelperComment'
    },
  },
  { timestamps: true }
);

const Helper = mongoose.model('Helper', helperSchema);

export default Helper;