import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Event from '../models/event.model.js';
import Sell from '../models/sell.model.js';
import Booking from '../models/Booking.js';
import Notification from '../models/notification.model.js';
import Escrow from '../models/escrow.model.js';
import Comment from '../models/comment.model.js';
import HelperComment from '../models/helper-comment.model.js';
import ServiceComment from '../models/service-comment.model.js';
import EventComment from '../models/event-comment.model.js';
import Review from '../models/Review.js';
import Conversation from '../models/Conversation.model.js';
import Message from '../models/Message.model.js';
import { deleteFirebaseUser, deleteFirebaseUserByEmail, verifyFirebaseIdToken } from '../utils/pushNotifications.js';
import { createUserNotification } from '../utils/notificationUtils.js';

const normalizeContactPhone = (contact) => String(
  typeof contact === 'string' ? contact : contact?.phone || ''
).replace(/\D/g, '');

const normalizeTrustedContacts = (contacts) => {
  if (!Array.isArray(contacts)) return { error: 'Trusted contacts must be a list.' };
  if (contacts.length > 10) return { error: 'You can save up to 10 trusted contacts.' };

  const normalized = [];
  const seenPhones = new Set();
  for (const item of contacts) {
    const name = typeof item === 'string' ? 'Trusted contact' : String(item?.name || '').trim();
    const phone = String(typeof item === 'string' ? item : item?.phone || '').trim();
    const digits = normalizeContactPhone(phone);
    if (!name || name.length > 80 || phone.length > 24 || digits.length < 7 || digits.length > 15) {
      return { error: 'Each trusted contact needs a name and a valid phone number.' };
    }
    if (seenPhones.has(digits)) return { error: 'A trusted contact phone number was added more than once.' };
    seenPhones.add(digits);
    normalized.push({ name, phone });
  }
  return { contacts: normalized };
};

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const getUsers = async (req, res, next) => {
  try {
    // The community directory only needs public profile fields; never return contact or account data here.
    const users = await User.find({}, 'username avatar bio offeringType createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.status(200).json(users);
  } catch (error) {
    next(errorHandler(500, 'Failed to fetch users'));
  }
};

export const registerPushToken = async (req, res, next) => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const platform = ['android', 'ios', 'web'].includes(req.body?.platform) ? req.body.platform : 'android';
    if (!token || token.length > 4096) {
      return res.status(400).json({ success: false, message: 'A valid push token is required.' });
    }

    const user = await User.findById(req.user.id).select('+pushTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // A mobile installation token belongs to one signed-in account at a time.
    await User.updateMany(
      { _id: { $ne: user._id }, 'pushTokens.token': token },
      { $pull: { pushTokens: { token } } }
    );
    const tokens = (user.pushTokens || []).filter((entry) => entry.token !== token);
    tokens.unshift({ token, platform, updatedAt: new Date() });
    user.pushTokens = tokens.slice(0, 10);
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const unregisterPushToken = async (req, res, next) => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    if (!token || token.length > 4096) {
      return res.status(400).json({ success: false, message: 'A valid push token is required.' });
    }
    await User.updateOne({ _id: req.user.id }, { $pull: { pushTokens: { token } } });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  let passwordChanged = false;
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));

  try {
    // List of allowed fields to update directly
    const allowedFields = [
        'username', 'email', 'avatar', 'coverPhoto', 'location', 'bio', 'phone', 'preferredLanguage',
      'occupation', 'interests', 'website', 'socialMedia',
      'faceData', 'profileVisibility', 'contactVisibility',
      'sharedInfo', 'dataSharing', 'securitySettings', 'plannerTasks',
      'contacts', 'accessContacts', 'notificationPreferences'
    ];

    const updateData = {};

    // Only add fields that are present in the request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    if (req.body.username !== undefined) {
      const username = String(req.body.username).trim();
      if (username.length < 3 || username.length > 40) {
        return next(errorHandler(400, 'Name must be between 3 and 40 characters.'));
      }
      updateData.username = username;
    }

    if (req.body.contacts !== undefined) {
      const result = normalizeTrustedContacts(req.body.contacts);
      if (result.error) return next(errorHandler(400, result.error));
      updateData.contacts = result.contacts;
    }

    // Allow account conversion to valid provider roles
    if (req.body.offeringType !== undefined) {
      const validRoles = ['viewer', 'services', 'property', 'food', 'goods'];
      if (validRoles.includes(req.body.offeringType)) {
        updateData.offeringType = req.body.offeringType;
      }
    }

    // Always update timestamp
    updateData.updatedAt = new Date();

    if (req.body.newPassword !== undefined || req.body.currentPassword !== undefined) {
      if (!req.body.newPassword) {
        return next(errorHandler(400, 'Enter a new password.'));
      }
      const existingUser = await User.findById(req.params.id).select('+password');
      if (!existingUser) return next(errorHandler(404, 'User not found.'));
      const hasPasswordLogin = (existingUser.authProviders || ['password']).includes('password');
      if (hasPasswordLogin && (!req.body.currentPassword || !bcryptjs.compareSync(req.body.currentPassword, existingUser.password))) {
        return next(errorHandler(401, 'Your current password is incorrect.'));
      }
      if (!hasPasswordLogin) {
        try {
          const decoded = await verifyFirebaseIdToken(String(req.body.firebaseIdToken || ''));
          if (String(decoded.email || '').toLowerCase() !== existingUser.email.toLowerCase()) {
            return next(errorHandler(401, 'Re-authenticate with the Google account connected to this LoopOut account.'));
          }
        } catch {
          return next(errorHandler(401, 'Re-authenticate with Google before setting a password.'));
        }
        updateData.authProviders = [...new Set([...(existingUser.authProviders || []), 'password'])];
      }
      if (req.body.newPassword.length < 12) {
        return next(errorHandler(400, 'Your new password must contain at least 12 characters.'));
      }
      updateData.password = bcryptjs.hashSync(req.body.newPassword, 12);
      passwordChanged = true;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,  // Return updated document
        runValidators: true  // Validate updates
      }
    ).select('-password -__v -otp -otpExpiry -otpAttempts -otpPurpose');  // Exclude credentials and one-time codes

    if (passwordChanged) {
      const refreshed = await User.findById(req.params.id).select('notificationPreferences').lean();
      if (refreshed?.notificationPreferences?.security?.passwordChanges !== false) {
        const message = 'Your LoopOut password was changed. If you did not make this change, secure your account now.';
        await new Notification({ userId: req.params.id, type: 'security', title: 'Password changed', message }).save();
        sendPushNotificationToUser(req.params.id, { title: 'Password changed', body: message, data: { type: 'security', route: '/settings?tab=security' }, preference: 'security.passwordChanges' }).catch(() => {});
      }
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.username) {
      return next(errorHandler(409, 'That name is already in use. Please choose another name.'));
    }
    next(error);
  }
};



export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return next(errorHandler(404, 'User not found!'));

    const currentPassword = String(req.body?.currentPassword || '');
    const hasPasswordLogin = (user.authProviders || ['password']).includes('password');
    let verifiedGoogleUid = '';
    if (req.body?.firebaseIdToken) {
      try {
        const decoded = await verifyFirebaseIdToken(String(req.body.firebaseIdToken));
        if (String(decoded.email || '').toLowerCase() !== user.email.toLowerCase()) {
          return next(errorHandler(401, 'Re-authenticate with the Google account connected to this LoopOut account.'));
        }
        verifiedGoogleUid = decoded.uid;
      } catch {
        return next(errorHandler(401, 'Your Google sign-in could not be verified. Please sign in again.'));
      }
    }
    const passwordValid = hasPasswordLogin && currentPassword && bcryptjs.compareSync(currentPassword, user.password);
    const isGoogleAuth = Boolean(req.body?.isGoogleAuth || req.body?.confirmDelete);
    const googleAllowed = !hasPasswordLogin && isGoogleAuth && (user.authProviders || []).includes('google');
    if (!passwordValid && !verifiedGoogleUid && !googleAllowed) {
      return next(errorHandler(401, hasPasswordLogin
        ? 'Enter your current password or re-authenticate with Google to delete your account.'
        : 'Re-authenticate with Google to delete your account.'));
    }

    const userId = req.params.id;

    const [listings, services, helpers, events] = await Promise.all([
      Listing.find({ userRef: userId }).select('_id').lean(),
      Service.find({ userRef: userId }).select('_id').lean(),
      Helper.find({ userRef: userId }).select('_id').lean(),
      Event.find({ userRef: userId }).select('_id').lean(),
    ]);
    const ownedListingIds = listings.map((item) => item._id);
    const ownedServiceIds = services.map((item) => item._id);
    const ownedHelperIds = helpers.map((item) => item._id);
    const ownedEventIds = events.map((item) => item._id);
    const bookingFilter = { $or: [
      { user: userId },
      ...(ownedListingIds.length ? [{ listing: { $in: ownedListingIds } }] : []),
      ...(ownedServiceIds.length ? [{ service: { $in: ownedServiceIds } }] : []),
      ...(ownedHelperIds.length ? [{ helper: { $in: ownedHelperIds } }] : []),
      ...(ownedEventIds.length ? [{ event: { $in: ownedEventIds } }] : []),
    ] };
    const bookingIds = (await Booking.find(bookingFilter).select('_id').lean()).map((item) => item._id);
    const conversationIds = (await Conversation.find({ participants: userId }).select('_id').lean()).map((item) => item._id);

    // Preserve bookings and listings while future work or held funds are unresolved.
    const activeBooking = await Booking.findOne({
      ...bookingFilter,
      status: { $in: ['pending', 'confirmed', 'approved', 'assigned', 'enroute', 'ongoing', 'work_completed'] },
      endDate: { $gte: new Date() },
    }).select('_id').lean();
    if (activeBooking) {
      return next(errorHandler(409, 'Resolve your upcoming or active bookings before deleting your account.'));
    }
    const unresolvedEscrow = bookingIds.length
      ? await Escrow.exists({ bookingId: { $in: bookingIds }, status: { $in: ['held', 'disputed'] } })
      : null;
    if (unresolvedEscrow) {
      return next(errorHandler(409, 'Resolve any held or disputed booking payments before deleting your account.'));
    }

    if ((user.authProviders || []).includes('google')) {
      try {
        if (verifiedGoogleUid) await deleteFirebaseUser(verifiedGoogleUid);
        else await deleteFirebaseUserByEmail(user.email);
      }
      catch (error) {
        if (error?.code !== 'auth/user-not-found') {
          return next(errorHandler(503, 'Google account deletion could not be completed. Please try again.'));
        }
      }
    }

    await Promise.all([
      bookingIds.length ? Escrow.deleteMany({ bookingId: { $in: bookingIds } }) : Promise.resolve(),
      Message.deleteMany({ $or: [{ sender: userId }, ...(conversationIds.length ? [{ conversationId: { $in: conversationIds } }] : [])] }),
      Conversation.deleteMany({ participants: userId }),
      ...[Comment, HelperComment, ServiceComment, EventComment].map((Model) => Model.deleteMany({
        $or: [
          { userId }, { 'replies.userId': userId },
          ...(ownedListingIds.length ? [{ listingId: { $in: ownedListingIds } }] : []),
          ...(ownedServiceIds.length ? [{ serviceId: { $in: ownedServiceIds } }] : []),
          ...(ownedHelperIds.length ? [{ helperId: { $in: ownedHelperIds } }] : []),
          ...(ownedEventIds.length ? [{ eventId: { $in: ownedEventIds } }] : []),
        ]
      })),
      Review.deleteMany({ $or: [{ author: userId }, { 'replies.author': userId }] }),
      ...[Comment, HelperComment, ServiceComment, EventComment, Review].map((Model) => Model.updateMany(
        { $or: [{ likes: userId }, { 'replies.userId': userId }, { 'replies.author': userId }] },
        { $pull: { likes: userId, replies: { $or: [{ userId }, { author: userId }] } } }
      )),
      User.updateMany({ $or: [{ followers: userId }, { following: userId }] }, { $pull: { followers: userId, following: userId } }),
      User.updateMany({ 'ratedBy.userId': userId }, { $pull: { ratedBy: { userId } } }),
      Booking.deleteMany(bookingFilter),
      Listing.deleteMany({ userRef: userId }),
      Service.deleteMany({ userRef: userId }),
      Helper.deleteMany({ userRef: userId }),
      Event.deleteMany({ userRef: userId }),
      Sell.deleteMany({ userRef: userId }),
      Notification.deleteMany({ $or: [{ userId }, { 'data.userId': userId }] }),
      User.findByIdAndDelete(userId),
    ]);

    res.clearCookie('access_token');
    res.status(200).json({ success: true, message: 'User and all associated data have been deleted!' });
  } catch (error) {
    next(error);
  }
};

export const downloadUserData = async (req, res, next) => {
  if (req.user.id !== req.params.id) return next(errorHandler(401, 'You can only download your own data.'));
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp -otpExpiry -otpAttempts -otpPurpose -idDocumentUrl -liveSelfieUrl -faceData -contacts -plannerTasks -__v')
      .lean();
    if (!user) return next(errorHandler(404, 'User not found.'));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="loopout-account-data.json"');
    res.status(200).send(JSON.stringify({ exportedAt: new Date().toISOString(), account: user }, null, 2));
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
    const isSelf = req.user?.id === req.params.id;
    const projection = isSelf
      ? '-password -__v -otp -otpExpiry -otpAttempts -otpPurpose'
      : '-password -__v -otp -otpExpiry -otpAttempts -otpPurpose -twoFactorEnabled -idDocumentUrl -liveSelfieUrl -faceData -contacts -plannerTasks';
    const user = await User.findById(req.params.id).select(projection);
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

export const getUserSellListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const sells = await Sell.find({ creator: req.params.id });
      res.status(200).json(sells);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own items!'));
  }
};

// Add this function to get user's post count including events and goods
export const getUserPostCount = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({
        count: 0,
        limit: 3,
        breakdown: { listings: 0, services: 0, helpers: 0, events: 0, goods: 0 }
      });
    }

    const [listingsCount, servicesCount, helpersCount, eventsCount, goodsCount] = await Promise.all([
      Listing.countDocuments({ userRef: userId }).catch(() => 0),
      Service.countDocuments({ userRef: userId }).catch(() => 0),
      Helper.countDocuments({ userRef: userId }).catch(() => 0),
      Event.countDocuments({ userRef: userId }).catch(() => 0),
      Sell.countDocuments({ creator: userId }).catch(() => 0)
    ]);

    const totalPosts = listingsCount + servicesCount + helpersCount + eventsCount + goodsCount;

    res.status(200).json({
      count: totalPosts,
      limit: 3,
      breakdown: {
        listings: listingsCount,
        services: servicesCount,
        helpers: helpersCount,
        events: eventsCount,
        goods: goodsCount
      }
    });
  } catch (error) {
    console.error('Failed to get user post count:', error);
    res.status(200).json({
      count: 0,
      limit: 3,
      breakdown: { listings: 0, services: 0, helpers: 0, events: 0, goods: 0 }
    });
  }
};

// POST version: reads userId from request body (used by CreateListing)
export const getPostCountByBody = async (req, res, next) => {
  try {
    const userId = req.body?.userId || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({
        count: 0,
        limit: 3,
        breakdown: { listings: 0, services: 0, helpers: 0, events: 0, goods: 0 }
      });
    }

    const [listingsCount, servicesCount, helpersCount, eventsCount, goodsCount] = await Promise.all([
      Listing.countDocuments({ userRef: userId }).catch(() => 0),
      Service.countDocuments({ userRef: userId }).catch(() => 0),
      Helper.countDocuments({ userRef: userId }).catch(() => 0),
      Event.countDocuments({ userRef: userId }).catch(() => 0),
      Sell.countDocuments({ creator: userId }).catch(() => 0)
    ]);

    const totalPosts = listingsCount + servicesCount + helpersCount + eventsCount + goodsCount;

    res.status(200).json({
      count: totalPosts,
      limit: 3,
      breakdown: {
        listings: listingsCount,
        services: servicesCount,
        helpers: helpersCount,
        events: eventsCount,
        goods: goodsCount
      }
    });
  } catch (error) {
    console.error('Failed to get user post count by body:', error);
    res.status(200).json({
      count: 0,
      limit: 3,
      breakdown: { listings: 0, services: 0, helpers: 0, events: 0, goods: 0 }
    });
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
    const userId = req.user?.id ? req.user.id.toString() : null;

    const host = await User.findById(hostId)
      .select('likeCount dislikeCount ratedBy');

    if (!host) {
      return next(errorHandler(404, 'Host not found'));
    }

    const userAction = (userId && Array.isArray(host.ratedBy))
      ? host.ratedBy.find(r => r.userId && r.userId.toString() === userId)?.action || null
      : null;

    res.status(200).json({
      likeCount: host.likeCount || 0,
      dislikeCount: host.dislikeCount || 0,
      userAction
    });
  } catch (error) {
    next(error);
  }
};

export const verifyWhatsApp = async (req, res, next) => {
  return next(errorHandler(410, 'WhatsApp connection cannot be used as account verification.'));
};

export const getPublicUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found!'));

    const {
      password, otp, otpExpiry, otpAttempts, otpPurpose, twoFactorEnabled, idDocumentUrl, liveSelfieUrl, faceData, contacts, plannerTasks,
      email, phone, contactVisibility, profileVisibility, sharedInfo = {}, dataSharing,
      coverPhoto,
      followers = [], following = [], likeCount = 0, dislikeCount = 0, reviews = [],
      bio, location, occupation, interests, website, socialMedia,
      ...rest
    } = user._doc;
    const isProfileOwner = req.user?.id === req.params.id;
    const profileIsVisible = isProfileOwner || profileVisibility !== false;
    const contactDetailsAreVisible = isProfileOwner || (profileIsVisible && contactVisibility === 'public');
    const reviewsAreVisible = isProfileOwner || (profileIsVisible && sharedInfo.reviews !== false);
    const connectionsAreVisible = isProfileOwner || (profileIsVisible && sharedInfo.socialConnections === true);

    // Fetch all user's content concurrently
    const [listings, services, helpers, events] = await Promise.all([
      Listing.find({ userRef: req.params.id }),
      Service.find({ creator: req.params.id }),
      Helper.find({ userRef: req.params.id }),
      Event.find({ userRef: req.params.id }),
    ]);

    res.status(200).json({
      ...rest,
      profileVisibility: profileIsVisible,
      ...(profileIsVisible ? { coverPhoto, bio, location, occupation, interests, website, socialMedia } : {}),
      ...(contactDetailsAreVisible ? { email, phone } : {}),
      likeCount: reviewsAreVisible ? likeCount : 0,
      dislikeCount: reviewsAreVisible ? dislikeCount : 0,
      reviews: reviewsAreVisible ? reviews : [],
      followers: connectionsAreVisible ? followers : [],
      following: connectionsAreVisible ? following : [],
      followersCount: connectionsAreVisible ? followers.length : 0,
      followingCount: connectionsAreVisible ? following.length : 0,
      listings,
      services,
      helpers,
      events,
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
    const user = await User.findById(req.params.id).select('followers sharedInfo profileVisibility').populate('followers', 'username avatar bio');
    if (!user) return next(errorHandler(404, 'User not found!'));
    if (req.user?.id !== req.params.id && (user.profileVisibility === false || user.sharedInfo?.socialConnections !== true)) return res.status(200).json([]);
    res.status(200).json(user.followers);
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('following sharedInfo profileVisibility').populate('following', 'username avatar bio');
    if (!user) return next(errorHandler(404, 'User not found!'));
    if (req.user?.id !== req.params.id && (user.profileVisibility === false || user.sharedInfo?.socialConnections !== true)) return res.status(200).json([]);
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
    const normalize = (contact) => normalizeContactPhone(contact).slice(-9);
    const targetNormalized = new Set(targetContacts.map(normalize).filter((phone) => phone.length >= 9));
    
    const mutualPhoneDigits = new Set(currentContacts.map(normalize).filter((phone) => (
      phone.length >= 9 && targetNormalized.has(phone)
    )));

    if (mutualPhoneDigits.size === 0) return res.status(200).json([]);

    // Phone numbers may be stored with different country-code/spacing formats.
    const mutuals = await User.find({
      phone: { $type: 'string', $ne: '' },
      _id: { $nin: [currentUserId, targetUserId] }
    }).select('username avatar phone _id');
    const matches = mutuals.filter((user) => mutualPhoneDigits.has(normalizeContactPhone(user.phone).slice(-9)));

    return res.status(200).json(matches.map((m) => ({
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
