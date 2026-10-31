import Helper from '../models/helper.model.js';
import HelperComment from '../models/helper-comment.model.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { errorHandler } from '../utils/error.js';
import { createUserNotification } from '../utils/notificationUtils.js';

const HELPER_RATING_FIELDS = {
  cleanliness: 'cleanlinessRating',
  communication: 'communicationRating',
  punctuality: 'punctualityRating',
  quality: 'qualityRating',
  respectfulness: 'respectfulnessRating',
  value: 'valueRating',
  recommendation: 'recommendationRating',
  barberCleaning: 'barberCleaningRating',
  haircut: 'haircutRating',
  equipment: 'equipmentRating',
  serviceCare: 'serviceCareRating',
  barberCommunication: 'barberCommunicationRating',
  beautyCleaning: 'beautyCleaningRating',
  beautyCommunication: 'beautyCommunicationRating',
  beautyEquipment: 'beautyEquipmentRating',
  hairdressing: 'hairdressingRating',
  timeliness: 'timelinessRating',
  tattooCleaning: 'tattooCleaningRating',
  tattooCommunication: 'tattooCommunicationRating',
  tattooEquipment: 'tattooEquipmentRating',
  tattooArtist: 'tattooArtistRating',
  tattooTimeliness: 'tattooTimelinessRating',
  photographyCleanliness: 'photographyCleanlinessRating',
  cameras: 'camerasRating',
  studio: 'studioRating',
  photographer: 'photographerRating',
  photographyCommunication: 'photographyCommunicationRating'
};

const summarizeHelperRatings = (comments, helperType = '') => {
  const normalizedType = String(helperType || '').toLowerCase();
  const activeRatingKeys = normalizedType === 'barber' || normalizedType === 'barbar'
    ? ['barberCleaning', 'haircut', 'equipment', 'serviceCare', 'barberCommunication']
    : normalizedType === 'beauty' || normalizedType === 'spa'
      ? ['beautyCleaning', 'beautyCommunication', 'beautyEquipment', 'hairdressing', 'timeliness']
      : normalizedType === 'tattoo' || normalizedType === 'tattoo_artist'
        ? ['tattooCleaning', 'tattooCommunication', 'tattooEquipment', 'tattooArtist', 'tattooTimeliness']
        : normalizedType === 'photography' || normalizedType === 'photographer' || normalizedType === 'photo'
          ? ['photographyCleanliness', 'cameras', 'studio', 'photographer', 'photographyCommunication']
          : ['cleanliness', 'communication', 'punctuality', 'quality', 'respectfulness', 'value', 'recommendation'];
  const activeRatingFields = activeRatingKeys.map((key) => HELPER_RATING_FIELDS[key]);
  const ratings = {};
  Object.entries(HELPER_RATING_FIELDS).forEach(([name, field]) => {
    if (!activeRatingFields.includes(field)) {
      ratings[name] = 0;
      return;
    }
    const values = comments.map((comment) => {
      let val = Number(comment[field]);
      if (!Number.isFinite(val) || val < 1 || val > 5) {
        if (name === 'photographyCleanliness') val = Number(comment.cleanlinessRating);
        else if (name === 'photographyCommunication') val = Number(comment.communicationRating);
        else if (name === 'photographer') val = Number(comment.qualityRating);
        else if (name === 'cameras') val = Number(comment.equipmentRating);
      }
      return Number.isFinite(val) && val >= 1 && val <= 5 ? val : null;
    }).filter(Boolean);
    ratings[name] = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  });
  ratings.staff = ratings.communication;

  const perReviewAverages = comments.map((comment) => {
    const values = activeRatingFields
      .map((field) => Number(comment[field]))
      .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }).filter((value) => value !== null);
  ratings.overall = perReviewAverages.length
    ? perReviewAverages.reduce((sum, value) => sum + value, 0) / perReviewAverages.length
    : 0;
  return ratings;
};

const summarizeHelperRatingCounts = (comments) => Object.fromEntries(
  Object.entries(HELPER_RATING_FIELDS).map(([name, field]) => [
    name,
    comments.filter((comment) => Number(comment[field]) >= 1 && Number(comment[field]) <= 5).length
  ])
);

export const createHelperComment = async (req, res, next) => {
  try {
    const {
      content, helperId, bookingId, userName, userAvatar,
      cleanlinessRating, communicationRating, punctualityRating,
      qualityRating, respectfulnessRating, valueRating, recommendationRating,
      barberCleaningRating, haircutRating, equipmentRating, serviceCareRating,
      barberCommunicationRating, beautyCleaningRating, beautyCommunicationRating,
      beautyEquipmentRating, hairdressingRating, timelinessRating,
      tattooCleaningRating, tattooCommunicationRating, tattooEquipmentRating,
      tattooArtistRating, tattooTimelinessRating,
      photographyCleanlinessRating, camerasRating, studioRating,
      photographerRating, photographyCommunicationRating
    } = req.body;
    const userId = req.user.id;

    if (!content || !helperId || !bookingId) {
      return next(errorHandler(400, 'Content, helper ID, and completed booking ID are required'));
    }
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return next(errorHandler(400, 'A valid completed booking ID is required'));
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return next(errorHandler(404, 'Helper not found'));
    }

    const completedBooking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      helper: helperId,
      status: 'completed'
    }).select('_id selectedPerformer');
    if (!completedBooking) {
      return next(errorHandler(403, 'Only the customer who completed this helper booking can review it'));
    }

    if (await HelperComment.exists({ bookingId })) {
      return next(errorHandler(409, 'This booking already has a review'));
    }

    const submittedRatings = {
      cleanlinessRating,
      communicationRating,
      punctualityRating,
      qualityRating,
      respectfulnessRating,
      valueRating,
      recommendationRating,
      barberCleaningRating,
      haircutRating,
      equipmentRating,
      serviceCareRating,
      barberCommunicationRating,
      beautyCleaningRating,
      beautyCommunicationRating,
      beautyEquipmentRating,
      hairdressingRating,
      timelinessRating,
      tattooCleaningRating,
      tattooCommunicationRating,
      tattooEquipmentRating,
      tattooArtistRating,
      tattooTimelinessRating,
      photographyCleanlinessRating,
      camerasRating,
      studioRating,
      photographerRating,
      photographyCommunicationRating
    };
    for (const [field, value] of Object.entries(submittedRatings)) {
      if (value === undefined || value === null) continue;
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue < 1 || numericValue > 5) {
        return next(errorHandler(400, `${field} must be between 1 and 5`));
      }
      submittedRatings[field] = numericValue;
    }

    const comment = new HelperComment({
      content,
      helperId,
      bookingId,
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg',
      performerName: completedBooking.selectedPerformer || undefined,
      ...submittedRatings
    });

    await comment.save();
    
    // Keep the helper's profile average in sync with the submitted category scores.
    const allComments = await HelperComment.find({ helperId });
    const ratings = summarizeHelperRatings(allComments, helper.type);

    if (!helper.comments) helper.comments = [];
    helper.comments.push(comment._id);
    helper.rating = Number(ratings.overall.toFixed(1));
    await helper.save();

    // Notify helper owner (userRef is the owner)
    if (helper.userRef?.toString() !== userId) {
      try {
        await createUserNotification(
          helper.userRef,
          'comment',
          'New Profile Review',
          `${userName || req.user.username} left a review on your helper profile`,
          { itemId: helperId, itemType: 'helper', commentId: comment._id }
        );
      } catch (notificationError) {
        console.error('Helper review saved, but provider notification failed:', notificationError);
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.bookingId) {
      return next(errorHandler(409, 'This booking already has a review'));
    }
    next(errorHandler(500, error.message || 'Failed to create helper comment'));
  }
};

export const getHelperComments = async (req, res, next) => {
  try {
    const { helperId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const fetchAll = req.query.all === 'true';
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = fetchAll ? 0 : (Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 5);
    const skip = fetchAll ? 0 : (page - 1) * limit;

    // Gracefully return empty if the ID doesn't belong to a Helper
    // (e.g. when CarWashPage or other pages reuse this component)
    const helperExists = await Helper.exists({ _id: helperId });
    if (!helperExists) {
      return res.status(200).json({
        comments: [],
        totalComments: 0,
        totalPages: 0,
        currentPage: page,
        ratings: { cleanliness: 0, staff: 0, overall: 0 },
        ratingCounts: {}
      });
    }

    let commentsQuery = HelperComment.find({ helperId }).sort({ createdAt: -1 }).skip(skip);
    if (limit > 0) commentsQuery = commentsQuery.limit(limit);
    const comments = await commentsQuery;

    const totalComments = await HelperComment.countDocuments({ helperId });

    // Calculate profile-wide averages for every rated category.
    const allComments = await HelperComment.find({ helperId });
    const helper = await Helper.findById(helperId).select('type').lean();
    const ratings = summarizeHelperRatings(allComments, helper?.type);

    res.status(200).json({
      comments,
      totalComments,
      totalPages: fetchAll ? 1 : Math.ceil(totalComments / limit),
      currentPage: page,
      ratedBookingIds: allComments.map((comment) => comment.bookingId).filter(Boolean).map((id) => id.toString()),
      ratingCounts: summarizeHelperRatingCounts(allComments),
      ratings: {
        ...ratings
      }
    });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to fetch helper comments'));
  }
};


export const likeHelperComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await HelperComment.findById(commentId);
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
    next(errorHandler(500, error.message || 'Failed to like helper comment'));
  }
};

export const addHelperReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content, userName, userAvatar } = req.body;
    const userId = req.user.id;

    if (!content) {
      return next(errorHandler(400, 'Reply content is required'));
    }

    const comment = await HelperComment.findById(commentId);
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
    next(errorHandler(500, error.message || 'Failed to add helper reply'));
  }
};

export const deleteHelperComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await HelperComment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    if (comment.userId.toString() !== userId) {
      return next(errorHandler(403, 'You can only delete your own comments'));
    }

    await Helper.findByIdAndUpdate(comment.helperId, {
      $pull: { comments: commentId }
    });

    await HelperComment.findByIdAndDelete(commentId);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to delete helper comment'));
  }
};
