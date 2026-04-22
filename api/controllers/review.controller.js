import Review from '../models/Review.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';
import { errorHandler } from '../utils/error.js';

export const createReview = async (req, res, next) => {
  try {
    const { content, rating, type } = req.body; // type: 'listing', 'service', 'helper', 'event'
    const entityId = req.params.entityId;
    
    if (!content || content.trim() === '') {
      return next(errorHandler(400, 'Review content cannot be empty'));
    }
    if (!rating || rating < 1 || rating > 5) {
      return next(errorHandler(400, 'Rating must be between 1 and 5'));
    }

    const reviewData = {
      content,
      rating,
      author: req.user.id
    };

    // Assign to correct entity
    let EntityModel;
    if (type === 'listing') {
      reviewData.listing = entityId;
      EntityModel = Listing;
    } else if (type === 'service') {
      reviewData.service = entityId;
      EntityModel = Service;
    } else if (type === 'helper') {
      reviewData.helper = entityId;
      EntityModel = Helper;
    } else if (type === 'event') {
      reviewData.event = entityId;
      EntityModel = Event;
    } else {
      return next(errorHandler(400, 'Invalid entity type'));
    }

    const newReview = new Review(reviewData);
    await newReview.save();

    // Update Entity Average Rating
    const reviews = await Review.find({ [type]: entityId });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await EntityModel.findByIdAndUpdate(entityId, { 
      rating: parseFloat(avgRating.toFixed(1)),
      $push: { reviews: newReview._id }
    });

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
