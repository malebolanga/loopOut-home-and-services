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
      enum: ['room', 'nanny', 'dog', 'roommate', 'other', 'sharing', 'place', 'pampering', 'household', 'others'],
    },
    budget: {
      type: Number,
      required: false,
    },
    contact: {
      type: String,
      required: true,
    },
    imageUrls: {
      type: [String],
      required: false,
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
