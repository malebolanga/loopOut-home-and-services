import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';
import { createUserNotification } from '../utils/notificationUtils.js';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const getUsers = async (req, res, next) => {
  try {
    // Exclude sensitive information from the response
    const users = await User.find({}, { password: 0, __v: 0, otp: 0, otpExpiry: 0, idDocumentUrl: 0, liveSelfieUrl: 0, faceData: 0, contacts: 0, plannerTasks: 0 });
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
      'username', 'email', 'avatar', 'coverPhoto', 'location', 'bio', 'phone',
      'occupation', 'interests', 'website', 'socialMedia',
      'faceData', 'whatsappNumber', 'whatsappVerified',
      'twoFactorEnabled', 'profileVisibility', 'contactVisibility',
      'sharedInfo', 'dataSharing', 'securitySettings', 'plannerTasks',
      'contacts', 'accessContacts'
    ];

    const updateData = {};

    // Only add fields that are present in the request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Auto-populate default contacts for demo when contacts access is enabled and contacts array is empty
    if (req.body.accessContacts === true) {
      const existingUser = await User.findById(req.params.id);
      if (existingUser && (!existingUser.contacts || existingUser.contacts.length === 0)) {
        updateData.contacts = ['+27821234567', '+27712345678', '+27612345679', '+27794478189'];
      }
    }

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
    const user = await User.findById(req.params.id).select('-password -__v -otp -otpExpiry -idDocumentUrl -liveSelfieUrl -faceData -contacts -plannerTasks');
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
      limit: 3,
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

// POST version: reads userId from request body (used by CreateListing)
export const getPostCountByBody = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    if (!userId) return next(errorHandler(400, 'userId is required'));

    const [listingsCount, servicesCount, helpersCount, eventsCount] = await Promise.all([
      Listing.countDocuments({ userRef: userId }),
      Service.countDocuments({ userRef: userId }),
      Helper.countDocuments({ userRef: userId }),
      Event.countDocuments({ userRef: userId })
    ]);

    const totalPosts = listingsCount + servicesCount + helpersCount + eventsCount;

    res.status(200).json({
      count: totalPosts,
      limit: 3,
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
      
      // Notify host
      await createUserNotification(
        hostId,
        'review',
        'New Profile Rating',
        `${req.user.username} gave you a ${action}!`,
        { action, raterId: userId }
      );
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

export const getPublicUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found!'));

    const { password, otp, otpExpiry, idDocumentUrl, liveSelfieUrl, faceData, contacts, plannerTasks, ...rest } = user._doc;

    // Fetch all user's content concurrently
    const [listings, services, helpers, events] = await Promise.all([
      Listing.find({ userRef: req.params.id }),
      Service.find({ creator: req.params.id }),
      Helper.find({ userRef: req.params.id }),
      Event.find({ userRef: req.params.id }),
    ]);

    res.status(200).json({
      ...rest,
      listings,
      services,
      helpers,
      events,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  const { id } = req.params;
  const currentUser = req.user.id;

  if (id === currentUser) {
    return next(errorHandler(400, 'You cannot follow yourself!'));
  }

  try {
    const userToFollow = await User.findById(id);
    if (!userToFollow) return next(errorHandler(404, 'User not found!'));

    await User.findByIdAndUpdate(id, {
      $addToSet: { followers: currentUser }
    });

    await User.findByIdAndUpdate(currentUser, {
      $addToSet: { following: id }
    });

    await createUserNotification(
      id,
      'system',
      'New Follower',
      `${req.user.username} is now following you!`,
      { followerId: currentUser }
    );

    res.status(200).json({ success: true, message: 'User followed successfully' });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  const { id } = req.params;
  const currentUser = req.user.id;

  try {
    await User.findByIdAndUpdate(id, {
      $pull: { followers: currentUser }
    });
    await User.findByIdAndUpdate(currentUser, {
      $pull: { following: id }
    });

    res.status(200).json({ success: true, message: 'User unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username avatar bio');
    if (!user) return next(errorHandler(404, 'User not found!'));
    res.status(200).json(user.followers);
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username avatar bio');
    if (!user) return next(errorHandler(404, 'User not found!'));
    res.status(200).json(user.following);
  } catch (error) {
    next(error);
  }
};

export const getMutualFriends = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return next(errorHandler(401, 'Unauthorized'));
    
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId).select('contacts accessContacts');
    if (!currentUser) return next(errorHandler(404, 'Current user not found'));

    const targetUser = await User.findById(targetUserId).select('contacts');
    if (!targetUser) return next(errorHandler(404, 'Target user not found'));

    if (!currentUser.accessContacts || !currentUser.contacts || currentUser.contacts.length === 0 || !targetUser.contacts || targetUser.contacts.length === 0) {
       return res.status(200).json([]);
    }

    const currentContacts = currentUser.contacts || [];
    const targetContacts = targetUser.contacts || [];

    // Helper to extract last 9 digits for robust matching across different formats
    const normalize = (p) => p.replace(/\D/g, '').slice(-9);
    const targetNormalized = new Set(targetContacts.map(normalize));
    
    const mutualPhones = currentContacts.filter(phone => {
        const norm = normalize(phone);
        return norm.length >= 9 && targetNormalized.has(norm);
    });

    if (mutualPhones.length === 0) {
        return res.status(200).json([]);
    }

    // Find users with these mutual phone numbers
    const mutuals = await User.find({
      phone: { $in: mutualPhones },
      _id: { $nin: [currentUserId, targetUserId] }
    }).select('username avatar phone _id');

    res.status(200).json(mutuals.map(m => ({
        username: m.username,
        avatar: m.avatar,
        phone: m.phone,
        _id: m._id
    })));

  } catch (error) {
    next(error);
  }
};

export const getUserByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    if (!phone) return next(errorHandler(400, 'Phone number is required'));

    // Normalize input phone: strip all non-digits and take last 9 digits for robust matching
    const normalizedInput = phone.replace(/\D/g, '').slice(-9);
    
    // We search for users whose stored phone number (when normalized) matches our normalized input
    // This is computationally expensive but necessary if phone numbers are stored in various formats
    // A better way would be to have a normalized_phone field in the DB.
    // For now, we'll try a regex match on the end of the string if it's long enough, 
    // or just find all and filter if the DB is small. 
    // Given the prompt, let's do a more direct match first and fallback.

    const user = await User.findOne({ 
        $or: [
            { phone: phone },
            { phone: { $regex: normalizedInput + "$" } }
        ]
    }).select('username avatar phone _id');

    if (!user) {
        return res.status(200).json(null);
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};