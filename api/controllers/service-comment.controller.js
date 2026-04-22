import Service from '../models/service.model.js';
import ServiceComment from '../models/service-comment.model.js';
import { errorHandler } from '../utils/error.js';
import { createUserNotification } from '../utils/notificationUtils.js';

export const createServiceComment = async (req, res, next) => {
  try {
    const { content, serviceId, userName, userAvatar, rating } = req.body;
    const userId = req.user.id;

    if (!content || !serviceId) {
      return next(errorHandler(400, 'Content and service ID are required'));
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return next(errorHandler(404, 'Service not found'));
    }

    const comment = new ServiceComment({
      content,
      serviceId,
      userId,
      userName: userName || req.user.username,
      userAvatar: userAvatar || req.user.avatar || '/default-avatar.jpg',
      rating: rating ? Number(rating) : 5
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
    next(errorHandler(500, error.message || 'Failed to create service comment'));
  }
};

export const getServiceComments = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const serviceExists = await Service.exists({ _id: serviceId });
    if (!serviceExists) {
      return next(errorHandler(404, 'Service not found'));
    }

    const comments = await ServiceComment.find({ serviceId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await ServiceComment.countDocuments({ serviceId });

    res.status(200).json({
      comments,
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
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