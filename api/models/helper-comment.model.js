import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    maxlength: [1000, 'Reply cannot exceed 1000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userName: {
    type: String,
    required: [true, 'Username is required']
  },
  userAvatar: {
    type: String,
    default: '/default-avatar.jpg'
  }
}, { timestamps: true });

const helperCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Helper',
    required: [true, 'Helper ID is required']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userName: {
    type: String,
    required: [true, 'Username is required']
  },
  userAvatar: {
    type: String,
    default: '/default-avatar.jpg'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  cleanlinessRating: {
    type: Number,
    min: 1,
    max: 5
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 5
  },
  punctualityRating: { type: Number, min: 1, max: 5 },
  qualityRating: { type: Number, min: 1, max: 5 },
  respectfulnessRating: { type: Number, min: 1, max: 5 },
  valueRating: { type: Number, min: 1, max: 5 },
  recommendationRating: { type: Number, min: 1, max: 5 },
  replies: [replySchema]
}, { timestamps: true });

// Historical comments may have no booking ID; new booking-linked reviews are unique per booking.
helperCommentSchema.index({ bookingId: 1 }, { unique: true, sparse: true });

const HelperComment = mongoose.model('HelperComment', helperCommentSchema);

export default HelperComment;
