import Helper from '../models/helper.model.js';
import { errorHandler } from '../utils/error.js';
import { createAreaNotifications } from '../utils/notificationUtils.js';

/**
 * @description Create a new helper profile.
 * The user's ID is attached to `req.user` by the `verifyToken` middleware.
 */
export const createHelper = async (req, res, next) => {
  try {
    const helper = await Helper.create({
      ...req.body,
      userRef: req.user.id
    });
    // Create notifications for users in the area
    createAreaNotifications(helper, 'helper');

    return res.status(201).json(helper);
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

/**
 * @description Get a specific helper profile by its ID.
 */
export const getHelper = async (req, res, next) => {
  try {
    const helper = await Helper.findById(req.params.id).populate('userRef');
    if (!helper) {
      return next(errorHandler(404, 'Helper not found!'));
    }
    res.status(200).json(helper);

  } catch (error) {
    next(error);
  }
};

/**
 * @description Get a list of helpers with search and sort functionality.
 */
export const getHelpers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const helpers = await Helper.find({
      ...(req.query.userId && { userRef: req.query.userId }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.address && { address: { $regex: req.query.address, $options: 'i' } }),
      ...(req.query.location && { address: { $regex: req.query.location, $options: 'i' } }),
      ...(req.query.searchTerm && {
        $or: [
          { name: { $regex: req.query.searchTerm, $options: 'i' } },
          { description: { $regex: req.query.searchTerm, $options: 'i' } },
          { skills: { $regex: req.query.searchTerm, $options: 'i' } }
        ],
      }),
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(helpers);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Update an existing helper profile.
 */
export const updateHelper = async (req, res, next) => {
  const helper = await Helper.findById(req.params.id);
  if (!helper) {
    return next(errorHandler(404, 'Helper not found!'));
  }
  if (req.user.id !== helper.userRef) {
    return next(errorHandler(401, 'You can only update your own helper listing!'));
  }

  try {
    const updatedHelper = await Helper.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedHelper);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Delete a helper profile.
 */
export const deleteHelper = async (req, res, next) => {
  try {
    const helper = await Helper.findById(req.params.id);

    if (!helper) {
      return next(errorHandler(404, 'Helper not found!'));
    }

    // *** FIX ***
    // The main error was here. The check for ownership must use 'userRef',
    // which is the field defined in your helper.model.js schema.
    // Using 'helper.creator' would cause a crash because it does not exist.
    if (req.user.id !== helper.userRef.toString()) {
      return next(errorHandler(401, 'You can only delete your own helper listing!'));
    }

    await Helper.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Helper has been deleted!',
    });
  } catch (error) {
    next(errorHandler(500, `Failed to delete helper: ${error.message}`));
  }
};

// Get Similar Helpers
export const getSimilarHelpers = async (req, res, next) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) {
      return next(errorHandler(404, 'Helper not found!'));
    }

    const similarHelpers = await Helper.find({
      _id: { $ne: req.params.id },
      type: helper.type,
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.status(200).json(similarHelpers);
  } catch (error) {
    next(error);
  }
};
