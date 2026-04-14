import LookingFor from '../models/lookingFor.model.js';
import { errorHandler } from '../utils/error.js';

export const createLookingFor = async (req, res, next) => {
  try {
    const lookingFor = await LookingFor.create(req.body);
    return res.status(201).json(lookingFor);
  } catch (error) {
    next(error);
  }
};

export const deleteLookingFor = async (req, res, next) => {
  const lookingFor = await LookingFor.findById(req.params.id);

  if (!lookingFor) {
    return next(errorHandler(404, 'Request not found!'));
  }

  if (req.user.id !== lookingFor.userRef.toString()) {
    return next(errorHandler(401, 'You can only delete your own requests!'));
  }

  try {
    await LookingFor.findByIdAndDelete(req.params.id);
    res.status(200).json('Request has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateLookingFor = async (req, res, next) => {
  const lookingFor = await LookingFor.findById(req.params.id);
  if (!lookingFor) {
    return next(errorHandler(404, 'Request not found!'));
  }
  if (req.user.id !== lookingFor.userRef.toString()) {
    return next(errorHandler(401, 'You can only update your own requests!'));
  }

  try {
    const updatedLookingFor = await LookingFor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedLookingFor);
  } catch (error) {
    next(error);
  }
};

export const getLookingFor = async (req, res, next) => {
  try {
    const lookingFor = await LookingFor.findById(req.params.id);
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
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    
    let active = req.query.active;
    if (active === undefined || active === 'all') {
      active = { $in: [false, true] };
    }

    const category = req.query.category || { $in: ['room', 'nanny', 'dog', 'roommate', 'other', 'sharing', 'place', 'pampering', 'household', 'others'] };
    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const lookingFors = await LookingFor.find({
      title: { $regex: searchTerm, $options: 'i' },
      active,
      category,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(lookingFors);
  } catch (error) {
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
