import Comment from '../models/comment.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createComment = async (req, res, next) => {
  try {
    const { content, listingId, userName, userAvatar, rating } = req.body;
    const userId = req.user.id;

    if (!content || !listingId) {
      return next(errorHandler(400, 'Content and listing ID are required'));
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    const comment = new Comment({
      content,
      listingId,
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg',
      rating: rating ? Number(rating) : undefined
    });

    await comment.save();

    // Initialize comments array if it doesn't exist
    if (!listing.comments) {
      listing.comments = [];
    }
    listing.comments.push(comment._id);
    await listing.save();

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
    if (!listingExists) {
      return next(errorHandler(404, 'Listing not found'));
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