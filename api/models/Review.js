import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    replies: [{
      content: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: Date
    }]
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;