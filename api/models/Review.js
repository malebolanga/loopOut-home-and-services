import mongoose from 'mongoose';
import { getSuspendedOwnerIds, hideSuspendedOwnerContent } from '../utils/hideSuspendedOwnerContent.js';

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
      ref: 'Listing'
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    helper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Helper'
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
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

reviewSchema.index({ bookingId: 1 }, { unique: true, sparse: true });
hideSuspendedOwnerContent(reviewSchema, [{ field: 'author' }]);
reviewSchema.pre('aggregate', async function hideSuspendedReviewAggregates() {
  const ids = await getSuspendedOwnerIds();
  if (ids.length) this.pipeline().unshift({ $match: { author: { $nin: ids } } });
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
