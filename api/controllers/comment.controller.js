import Listing from '../models/listing.model.js';
import LookingFor from '../models/lookingFor.model.js';
import Comment from '../models/comment.model.js';
import { errorHandler } from '../utils/error.js';
import { createUserNotification } from '../utils/notificationUtils.js';

export const createComment = async (req, res, next) => {
  try {
    const { content, listingId, userName, userAvatar, rating } = req.body;
    const userId = req.user.id;

    if (!content || !listingId) {
      return next(errorHandler(400, 'Content and target ID are required'));
    }

    // Check if it's a listing OR a looking-for request
    let target = await Listing.findById(listingId);
    let targetType = 'listing';
    
    if (!target) {
      target = await LookingFor.findById(listingId);
      targetType = 'lookingFor';
    }

    if (!target) {
      return next(errorHandler(404, 'Listing or Request not found'));
    }

    const comment = new Comment({
      content,
      listingId, // keeping the field name as listingId in the DB for now to avoid migration
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg',
      rating: rating ? Number(rating) : undefined
    });

    await comment.save();

    // Initialize comments array if it doesn't exist
    if (!target.comments) {
      target.comments = [];
    }
    target.comments.push(comment._id);

    // Update the average rating on the target entity
    if (rating) {
      const allComments = await Comment.find({ listingId, rating: { $exists: true, $ne: null } });
      if (allComments.length > 0) {
        const sum = allComments.reduce((acc, curr) => acc + curr.rating, 0);
        target.rating = sum / allComments.length;
      } else {
        target.rating = Number(rating);
      }
    }

    await target.save();

    // Notify owner
    const ownerId = targetType === 'listing' ? target.userRef : target.userRef;
    const itemName = targetType === 'listing' ? target.name : target.title;

    if (ownerId.toString() !== userId) {
      await createUserNotification(
        ownerId,
        'system',
        'New Comment',
        `${userName || req.user.username} commented on your ${targetType === 'listing' ? 'listing' : 'request'} "${itemName}"`,
        { itemId: listingId, itemType: targetType, commentId: comment._id }
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to create comment'));
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const listingExists = await Listing.exists({ _id: listingId });
    const requestExists = !listingExists ? await LookingFor.exists({ _id: listingId }) : false;

    if (!listingExists && !requestExists) {
      return next(errorHandler(404, 'Listing or Request not found'));
    }

    const comments = await Comment.find({ listingId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({ listingId });

    // Calculate ratings summary based on comments
    const allComments = await Comment.find({ listingId, rating: { $exists: true, $ne: null } });

    let ratings = {
      cleanliness: 0,
      staff: 0,
      overall: 0
    };

    if (allComments.length > 0) {
      const sum = allComments.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = sum / allComments.length;

      // We're assigning the same average to categories for now 
      // since the comment only has a single overall rating
      ratings = {
        cleanliness: avg,
        staff: avg,
        overall: avg
      };
    }

    res.status(200).json({
      comments,
      totalComments,
      ratings,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page
    });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to fetch comments'));
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
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
    next(errorHandler(500, error.message || 'Failed to like comment'));
  }
};

export const addReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content, userName, userAvatar } = req.body;
    const userId = req.user.id;

    if (!content) {
      return next(errorHandler(400, 'Reply content is required'));
    }

    const comment = await Comment.findById(commentId);
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
    next(errorHandler(500, error.message || 'Failed to add reply'));
  }
};