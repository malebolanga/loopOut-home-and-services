import LookingFor from '../models/lookingFor.model.js';
import { errorHandler } from '../utils/error.js';
import { hasProfanity, logProfanityEvent } from '../utils/profanityFilter.js';

export const createLookingFor = async (req, res, next) => {
  try {
    const userRef = req.user?.id || req.body.userRef;
    if (!userRef) {
      return next(errorHandler(401, 'User must be authenticated to broadcast a task.'));
    }

    const { 
      title, 
      description, 
      category, 
      location, 
      budget, 
      urgency, 
      contact, 
      contactPhone, 
      imageUrls,
      deviceType,
      requestLocation
    } = req.body;

    if (!title || !description || !location) {
      return next(errorHandler(400, 'Title, description, and location are required.'));
    }

    if (hasProfanity(title) || hasProfanity(description)) {
      logProfanityEvent(userRef || 'guest', 'lookingFor_create', `${title} | ${description}`);
      return next(errorHandler(400, 'Your request contains inappropriate language. Please revise it.'));
    }

    // 24-hour expiration window
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const lookingFor = await LookingFor.create({
      userRef,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      category: category || 'other',
      budget: Number(budget) || 0,
      urgency: urgency || 'flexible',
      contact: contact || contactPhone || 'In-app message',
      contactPhone: contactPhone || contact || '',
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      deviceType: deviceType || 'web',
      requestLocation: requestLocation || location,
      active: true,
      expiresAt,
    });

    const populated = await LookingFor.findById(lookingFor._id).populate('userRef', 'username avatar email phone');
    return res.status(201).json(populated || lookingFor);
  } catch (error) {
    console.error('Error in createLookingFor:', error);
    next(error);
  }
};

export const deleteLookingFor = async (req, res, next) => {
  try {
    const lookingFor = await LookingFor.findById(req.params.id);

    if (!lookingFor) {
      return next(errorHandler(404, 'Request not found!'));
    }

    if (req.user.id !== lookingFor.userRef.toString()) {
      return next(errorHandler(401, 'You can only delete your own requests!'));
    }

    await LookingFor.findByIdAndDelete(req.params.id);
    res.status(200).json('Request has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateLookingFor = async (req, res, next) => {
  try {
    const lookingFor = await LookingFor.findById(req.params.id);
    if (!lookingFor) {
      return next(errorHandler(404, 'Request not found!'));
    }
    if (req.user.id !== lookingFor.userRef.toString()) {
      return next(errorHandler(401, 'You can only update your own requests!'));
    }

    const { title, description } = req.body;
    if (title && description && (hasProfanity(title) || hasProfanity(description))) {
      logProfanityEvent(req.user.id, 'lookingFor_update', `${title} | ${description}`);
      return next(errorHandler(400, 'Your request contains inappropriate language. Please revise it.'));
    }

    const updatedLookingFor = await LookingFor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('userRef', 'username avatar email phone');

    res.status(200).json(updatedLookingFor);
  } catch (error) {
    next(error);
  }
};

export const getLookingFor = async (req, res, next) => {
  try {
    const lookingFor = await LookingFor.findById(req.params.id).populate('userRef', 'username avatar email phone');
    if (!lookingFor) {
      return next(errorHandler(404, 'Request not found!'));
    }
    res.status(200).json(lookingFor);
  } catch (error) {
    next(error);
  }
};

export const getLookingFors = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const startIndex = parseInt(req.query.startIndex) || 0;
    
    // 24 hours expiration window: only fetch posts created within the last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const query = {
      active: true,
      createdAt: { $gte: twentyFourHoursAgo },
    };

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.searchTerm) {
      query.$or = [
        { title: { $regex: req.query.searchTerm, $options: 'i' } },
        { description: { $regex: req.query.searchTerm, $options: 'i' } },
        { location: { $regex: req.query.searchTerm, $options: 'i' } },
      ];
    }

    const sort = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const lookingFors = await LookingFor.find(query)
      .populate('userRef', 'username avatar email phone')
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(lookingFors);
  } catch (error) {
    console.error('Error in getLookingFors:', error);
    next(error);
  }
};

export const likeLookingFor = async (req, res, next) => {
  try {
    const lookingFor = await LookingFor.findById(req.params.id);
    if (!lookingFor) return next(errorHandler(404, 'Request not found!'));

    const userId = req.user.id;
    if (lookingFor.likes.includes(userId)) {
      lookingFor.likes = lookingFor.likes.filter((id) => id.toString() !== userId);
    } else {
      lookingFor.likes.push(userId);
      lookingFor.dislikes = lookingFor.dislikes.filter((id) => id.toString() !== userId);
    }
    await lookingFor.save();
    res.status(200).json(lookingFor);
  } catch (error) {
    next(error);
  }
};

export const dislikeLookingFor = async (req, res, next) => {
  try {
    const lookingFor = await LookingFor.findById(req.params.id);
    if (!lookingFor) return next(errorHandler(404, 'Request not found!'));

    const userId = req.user.id;
    if (lookingFor.dislikes.includes(userId)) {
      lookingFor.dislikes = lookingFor.dislikes.filter((id) => id.toString() !== userId);
    } else {
      lookingFor.dislikes.push(userId);
      lookingFor.likes = lookingFor.likes.filter((id) => id.toString() !== userId);
    }
    await lookingFor.save();
    res.status(200).json(lookingFor);
  } catch (error) {
    next(error);
  }
};
