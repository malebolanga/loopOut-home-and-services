import Review from '../models/Review.js';
import { errorHandler } from '../utils/error.js';

export const createReview = async (req, res, next) => {
  try {
    const { content } = req.body;
    const listingId = req.params.listingId;
    
    if (!content || content.trim() === '') {
      return next(errorHandler(400, 'Review content cannot be empty'));
    }

    const newReview = new Review({
      content,
      listing: listingId,
      author: req.user.id
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

export const getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return next(errorHandler(404, 'Review not found'));
    }

    if (review.author.toString() !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, 'Unauthorized to delete this review'));
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Optional: Helpful counter controller
export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return next(errorHandler(404, 'Review not found'));

    review.helpfulCount += 1;
    await review.save();
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};
