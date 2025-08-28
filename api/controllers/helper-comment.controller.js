import HelperComment from '../models/helper-comment.model.js';
import Helper from '../models/helper.model.js';
import { errorHandler } from '../utils/error.js';

export const createHelperComment = async (req, res, next) => {
  try {
    const { content, helperId, userName, userAvatar } = req.body;
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
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg'
    });

    await comment.save();
    
    if (!helper.comments) helper.comments = [];
    helper.comments.push(comment._id);
    await helper.save();

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

    const helperExists = await Helper.exists({ _id: helperId });
    if (!helperExists) {
      return next(errorHandler(404, 'Helper not found'));
    }

    const comments = await HelperComment.find({ helperId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await HelperComment.countDocuments({ helperId });

    res.status(200).json({
      comments,
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page
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