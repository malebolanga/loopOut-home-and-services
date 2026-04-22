import Helper from '../models/helper.model.js';
import HelperComment from '../models/helper-comment.model.js';
import { errorHandler } from '../utils/error.js';
import { createUserNotification } from '../utils/notificationUtils.js';

export const createHelperComment = async (req, res, next) => {
  try {
    const { content, helperId, userName, userAvatar, cleanlinessRating, communicationRating } = req.body;
    const userId = req.user.id;

    if (!content || !helperId) {
      return next(errorHandler(400, 'Content and helper ID are required'));
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return next(errorHandler(404, 'Helper not found'));
    }

    const comment = new HelperComment({
      content,
      helperId,
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg',
      cleanlinessRating: cleanlinessRating || 5,
      communicationRating: communicationRating || 5
    });

    await comment.save();
    
    // Update Helper Average Rating
    const allComments = await HelperComment.find({ helperId });
    let totalCleanliness = 0;
    let totalCommunication = 0;
    
    allComments.forEach(c => {
      totalCleanliness += c.cleanlinessRating || 5;
      totalCommunication += c.communicationRating || 5;
    });

    const cleanliness = allComments.length > 0 ? (totalCleanliness / allComments.length) : 0;
    const communication = allComments.length > 0 ? (totalCommunication / allComments.length) : 0;
    const overall = allComments.length > 0 ? ((cleanliness + communication) / 2) : 0;

    if (!helper.comments) helper.comments = [];
    helper.comments.push(comment._id);
    helper.rating = Number(overall.toFixed(1));
    await helper.save();

    // Notify helper owner (userRef is the owner)
    if (helper.userRef.toString() !== userId) {
      await createUserNotification(
        helper.userRef,
        'comment',
        'New Profile Review',
        `${userName || req.user.username} left a review on your helper profile`,
        { itemId: helperId, itemType: 'helper', commentId: comment._id }
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to create helper comment'));
  }
};

export const getHelperComments = async (req, res, next) => {
  try {
    const { helperId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Gracefully return empty if the ID doesn't belong to a Helper
    // (e.g. when CarWashPage or other pages reuse this component)
    const helperExists = await Helper.exists({ _id: helperId });
    if (!helperExists) {
      return res.status(200).json({
        comments: [],
        totalComments: 0,
        totalPages: 0,
        currentPage: page,
        ratings: { cleanliness: 0, staff: 0, overall: 0 }
      });
    }

    const comments = await HelperComment.find({ helperId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await HelperComment.countDocuments({ helperId });

    // Calculate ratings
    const allComments = await HelperComment.find({ helperId });
    let totalCleanliness = 0;
    let totalCommunication = 0;

    allComments.forEach(c => {
      totalCleanliness += c.cleanlinessRating || 5;
      totalCommunication += c.communicationRating || 5;
    });

    const cleanliness = totalComments > 0 ? (totalCleanliness / totalComments) : 0;
    const communication = totalComments > 0 ? (totalCommunication / totalComments) : 0;
    const overall = totalComments > 0 ? ((cleanliness + communication) / 2) : 0;

    res.status(200).json({
      comments,
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      ratings: {
        cleanliness,
        staff: communication,
        overall
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