import Event from '../models/event.model.js';
import EventComment from '../models/event-comment.model.js';
import { errorHandler } from '../utils/error.js';
import { createUserNotification } from '../utils/notificationUtils.js';

export const createEventComment = async (req, res, next) => {
  try {
    const { content, eventId, userName, userAvatar, rating } = req.body;
    const userId = req.user.id;

    if (!content || !eventId) {
      return next(errorHandler(400, 'Content and event ID are required'));
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return next(errorHandler(404, 'Event not found'));
    }

    const comment = new EventComment({
      content,
      eventId,
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg',
      rating: rating ? Number(rating) : 5
    });

    await comment.save();
    
    // Update Event Average Rating
    const allComments = await EventComment.find({ eventId, rating: { $exists: true } });
    const avgRating = allComments.reduce((acc, curr) => acc + curr.rating, 0) / allComments.length;

    if (!event.comments) event.comments = [];
    event.comments.push(comment._id);
    event.rating = Number(avgRating.toFixed(1));
    await event.save();

    // Notify event owner
    if (event.userRef.toString() !== userId) {
      await createUserNotification(
        event.userRef,
        'comment',
        'New Event Comment',
        `${userName || req.user.username} commented on your event "${event.name}"`,
        { itemId: eventId, itemType: 'event', commentId: comment._id }
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to create event comment'));
  }
};

export const getEventComments = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const eventExists = await Event.exists({ _id: eventId });
    if (!eventExists) {
      return next(errorHandler(404, 'Event not found'));
    }

    const comments = await EventComment.find({ eventId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await EventComment.countDocuments({ eventId });

    res.status(200).json({
      comments,
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page
    });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to fetch event comments'));
  }
};

export const likeEventComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await EventComment.findById(commentId);
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
    next(errorHandler(500, error.message || 'Failed to like event comment'));
  }
};

export const addEventReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content, userName, userAvatar } = req.body;
    const userId = req.user.id;

    if (!content) {
      return next(errorHandler(400, 'Reply content is required'));
    }

    const comment = await EventComment.findById(commentId);
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
    next(errorHandler(500, error.message || 'Failed to add event reply'));
  }
};

export const deleteEventComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await EventComment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    if (comment.userId.toString() !== userId) {
      return next(errorHandler(403, 'You can only delete your own comments'));
    }

    await Event.findByIdAndUpdate(comment.eventId, {
      $pull: { comments: commentId }
    });

    await EventComment.findByIdAndDelete(commentId);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to delete event comment'));
  }
};