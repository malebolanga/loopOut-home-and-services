import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const getUsers = async (req, res, next) => {
  try {
    // Exclude sensitive information from the response
    const users = await User.find({}, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    res.status(200).json(users);
  } catch (error) {
    next(errorHandler(500, 'Failed to fetch users'));
  }
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));

  try {
    // List of allowed fields to update directly
    const allowedFields = [
      'username', 'email', 'avatar', 'location', 'bio', 'phone',
      'occupation', 'interests', 'website', 'socialMedia',
      'faceData', 'whatsappNumber', 'whatsappVerified',
      'twoFactorEnabled', 'profileVisibility', 'contactVisibility',
      'sharedInfo', 'dataSharing', 'securitySettings'
    ];

    const updateData = {};

    // Only add fields that are present in the request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Always update timestamp
    updateData.updatedAt = new Date();

    // Only hash and update password if provided
    if (req.body.password) {
      updateData.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,  // Return updated document
        runValidators: true  // Validate updates
      }
    ).select('-password -__v');  // Exclude sensitive fields

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};



export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};


export const getUserServices = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const services = await Service.find({ userRef: req.params.id });
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own services!'));
  }
};



export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) return next(errorHandler(404, 'User not found!'));
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Add this function to get user's helpers
export const getUserHelpers = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const helpers = await Helper.find({ userRef: req.params.id });
      res.status(200).json(helpers);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own helpers!'));
  }
};

// Add this function to get user's events
export const getUserEvents = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const events = await Event.find({ userRef: req.params.id });
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own events!'));
  }
};

// Add this function to get user's post count including events
export const getUserPostCount = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const [listingsCount, servicesCount, helpersCount, eventsCount] = await Promise.all([
      Listing.countDocuments({ userRef: userId }),
      Service.countDocuments({ userRef: userId }),
      Helper.countDocuments({ userRef: userId }),
      Event.countDocuments({ userRef: userId })
    ]);

    const totalPosts = listingsCount + servicesCount + helpersCount + eventsCount;

    res.status(200).json({
      count: totalPosts,
      breakdown: {
        listings: listingsCount,
        services: servicesCount,
        helpers: helpersCount,
        events: eventsCount
      }
    });
  } catch (error) {
    next(errorHandler(500, 'Failed to get user post count'));
  }
};

// Add these functions at the bottom

export const rateHost = async (req, res, next) => {
  try {
    const { hostId } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    // Validate action
    if (!['like', 'dislike'].includes(action)) {
      return next(errorHandler(400, 'Invalid action'));
    }

    const host = await User.findById(hostId);
    if (!host) {
      return next(errorHandler(404, 'Host not found'));
    }

    // Check if user already rated this host
    const existingRatingIndex = host.ratedBy.findIndex(
      rating => rating.userId.toString() === userId
    );

    let update = {};
    let message = '';

    if (existingRatingIndex !== -1) {
      const existingAction = host.ratedBy[existingRatingIndex].action;

      if (existingAction === action) {
        // User is removing their rating
        host.ratedBy.splice(existingRatingIndex, 1);
        update = {
          $inc: {
            [`${action}Count`]: -1
          }
        };
        message = `Removed your ${action}`;
      } else {
        // User is changing their rating
        host.ratedBy[existingRatingIndex].action = action;
        update = {
          $inc: {
            [`${existingAction}Count`]: -1,
            [`${action}Count`]: 1
          }
        };
        message = `Changed to ${action}`;
      }
    } else {
      // New rating
      host.ratedBy.push({ userId, action });
      update = {
        $inc: {
          [`${action}Count`]: 1
        }
      };
      message = `Added your ${action}`;
    }

    // Update host counts
    await User.findByIdAndUpdate(hostId, update);

    // Fetch updated host
    const updatedHost = await User.findById(hostId)
      .select('likeCount dislikeCount ratedBy');

    res.status(200).json({
      success: true,
      message,
      likeCount: updatedHost.likeCount,
      dislikeCount: updatedHost.dislikeCount,
      userAction: updatedHost.ratedBy.find(r => r.userId.toString() === userId)?.action || null
    });
  } catch (error) {
    next(error);
  }
};

export const getHostRatings = async (req, res, next) => {
  try {
    const { hostId } = req.params;
    const userId = req.user.id;

    const host = await User.findById(hostId)
      .select('likeCount dislikeCount ratedBy');

    if (!host) {
      return next(errorHandler(404, 'Host not found'));
    }

    const userAction = host.ratedBy.find(r =>
      r.userId.toString() === userId
    )?.action || null;

    res.status(200).json({
      likeCount: host.likeCount,
      dislikeCount: host.dislikeCount,
      userAction
    });
  } catch (error) {
    next(error);
  }
};

export const verifyWhatsApp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { whatsappNumber } = req.body;

    if (req.user.id !== id) {
      return next(errorHandler(401, 'You can only verify your own WhatsApp!'));
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          whatsappNumber,
          whatsappVerified: true,
          isVerified: true,
        },
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'WhatsApp number verified successfully!',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};