import mongoose from 'mongoose';

const lookingForSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'other',
    },
    urgency: {
      type: String,
      enum: ['flexible', 'today', 'immediate', 'urgent'],
      default: 'flexible',
    },
    budget: {
      type: Number,
      required: false,
      default: 0,
    },
    contact: {
      type: String,
      required: false,
      default: 'In-app message',
    },
    contactPhone: {
      type: String,
      required: false,
    },
    imageUrls: {
      type: [String],
      required: false,
      default: [],
    },
    deviceType: {
      type: String,
      required: false,
    },
    requestLocation: {
      type: String,
      required: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Comment',
      default: [],
    },
  },
  { timestamps: true }
);

const LookingFor = mongoose.model('LookingFor', lookingForSchema);

export default LookingFor;
