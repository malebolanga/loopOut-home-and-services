import Service from '../models/service.model.js';
import Booking from '../models/Booking.js';
import ServiceComment from '../models/service-comment.model.js';
import mongoose from 'mongoose';
import { errorHandler } from '../utils/error.js';
import { createUserNotification } from '../utils/notificationUtils.js';

export const createServiceComment = async (req, res, next) => {
  try {
    const {
      content, serviceId, bookingId, userName, userAvatar, rating,
      punctualityRating, qualityRating, communicationRating, cleanlinessRating,
      respectfulnessRating, valueRating, recommendationRating,
      tyresRating, interiorRating, exteriorRating, dashboardRating, windowsRating, matsRating, serviceCommunicationRating
    } = req.body;
    const userId = req.user.id;

    if (!content || !serviceId) {
      return next(errorHandler(400, 'Content and service ID are required'));
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return next(errorHandler(404, 'Service not found'));
    }

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) return next(errorHandler(400, 'A completed booking is required to leave a service review'));
    const completedBooking = await Booking.findOne({ _id: bookingId, user: userId, service: serviceId, status: 'completed' }).select('_id');
    if (!completedBooking) return next(errorHandler(403, 'Only the customer who completed this service booking can review it'));
    if (await ServiceComment.exists({ bookingId })) return next(errorHandler(409, 'This booking already has a review'));

    const categoryRatings = { punctualityRating, qualityRating, communicationRating, cleanlinessRating, respectfulnessRating, valueRating, recommendationRating, tyresRating, interiorRating, exteriorRating, dashboardRating, windowsRating, matsRating, serviceCommunicationRating };
    for (const [field, value] of Object.entries(categoryRatings)) {
      if (value === undefined || value === null || value === '') continue;
      const score = Number(value);
      if (!Number.isFinite(score) || score < 1 || score > 5) return next(errorHandler(400, `${field} must be between 1 and 5`));
      categoryRatings[field] = score;
    }

    const comment = new ServiceComment({
      content,
      bookingId,
      serviceId,
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg',
      rating: rating ? Number(rating) : 5,
      ...categoryRatings
    });

    await comment.save();
    
    // Update Service Average Rating
    const comments = await ServiceComment.find({ serviceId, rating: { $exists: true } });
    const avgRating = comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length;

    service.rating = Number(avgRating.toFixed(1));
    service.comments.push(comment._id);
    await service.save();

    // Notify service owner
    if (service.creator.toString() !== userId) {
      await createUserNotification(
        service.creator,
        'comment',
        'New Service Comment',
        `${userName || req.user.username} commented on your service "${service.name}"`,
        { itemId: serviceId, itemType: 'service', commentId: comment._id }
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    if (error?.code === 11000) return next(errorHandler(409, 'This booking already has a review'));
    next(errorHandler(500, error.message || 'Failed to create service comment'));
  }
};

export const getServiceComments = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.all === 'true' ? 0 : Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const serviceExists = await Service.exists({ _id: serviceId });
    if (!serviceExists) {
      return next(errorHandler(404, 'Service not found'));
    }

    let commentsQuery = ServiceComment.find({ serviceId }).sort({ createdAt: -1 });
    if (limit > 0) commentsQuery = commentsQuery.skip(skip).limit(limit);
    const comments = await commentsQuery;

    const totalComments = await ServiceComment.countDocuments({ serviceId });
    const allReviews = await ServiceComment.find({ serviceId }).select('rating bookingId punctualityRating qualityRating communicationRating cleanlinessRating respectfulnessRating valueRating recommendationRating tyresRating interiorRating exteriorRating dashboardRating windowsRating matsRating serviceCommunicationRating').lean();
    const ratings = allReviews.map((review) => Number(review.rating)).filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);
    const overall = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0;
    const categoryFields = ['punctualityRating', 'qualityRating', 'communicationRating', 'cleanlinessRating', 'respectfulnessRating', 'valueRating', 'recommendationRating'];
    const carWashCategoryFields = ['tyresRating', 'interiorRating', 'exteriorRating', 'dashboardRating', 'windowsRating', 'matsRating', 'serviceCommunicationRating'];
    const categoryAverages = Object.fromEntries([...categoryFields, ...carWashCategoryFields].map((field) => {
      const scores = allReviews.map((review) => Number(review[field])).filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);
      return [field, scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0];
    }));
    const ratingCounts = Object.fromEntries([...categoryFields, ...carWashCategoryFields].map((field) => [
      field,
      allReviews.filter((review) => Number.isFinite(Number(review[field])) && Number(review[field]) >= 1 && Number(review[field]) <= 5).length
    ]));

    res.status(200).json({
      comments,
      totalComments,
      ratings: { overall, ...categoryAverages },
      ratingCounts,
      ratedBookingIds: allReviews.map((review) => String(review.bookingId || '')).filter(Boolean),
      totalPages: limit > 0 ? Math.ceil(totalComments / limit) : 1,
      currentPage: page
    });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to fetch service comments'));
  }
};

export const likeServiceComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await ServiceComment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    const alreadyLiked = comment.likes.includes(userId);
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to like service comment'));
  }
};

export const addServiceReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content, userName, userAvatar } = req.body;
    const userId = req.user.id;

    if (!content) {
      return next(errorHandler(400, 'Reply content is required'));
    }

    const comment = await ServiceComment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    const reply = {
      content,
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg'
    };

    comment.replies.push(reply);
    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to add service reply'));
  }
};

export const deleteServiceComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await ServiceComment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    if (comment.userId.toString() !== userId) {
      return next(errorHandler(403, 'You can only delete your own comments'));
    }

    // Remove comment from service
    await Service.findByIdAndUpdate(comment.serviceId, {
      $pull: { comments: commentId }
    });

    await ServiceComment.findByIdAndDelete(commentId);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to delete service comment'));
  }
};
