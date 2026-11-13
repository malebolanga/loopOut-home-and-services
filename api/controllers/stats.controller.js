import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import GoodsOrder from '../models/goodsOrder.model.js';
import Notification from '../models/notification.model.js';
import SOSAlert from '../models/sosAlert.model.js';
import Sell from '../models/sell.model.js';
import Event from '../models/event.model.js';
import Shop from '../models/shop.model.js';
import TableBooking from '../models/tableBooking.model.js';
import FoodOrder from '../models/foodOrder.model.js';
import UserSectionActivity from '../models/userSectionActivity.model.js';
import UserActivityHistory from '../models/userActivityHistory.model.js';
import UserLoginArea from '../models/userLoginArea.model.js';
import { isLoopOutAdminEmail } from '../utils/requireLoopOutAdmin.js';
import { invalidateAccountStatusCache } from '../utils/verifyUser.js';
import { invalidateSuspendedOwnerCache, getSuspendedOwnerIds } from '../utils/hideSuspendedOwnerContent.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now).reduce((parts, item) => ({ ...parts, [item.type]: item.value }), {});
    const startOfToday = new Date(`${dateParts.year}-${dateParts.month}-${dateParts.day}T00:00:00+02:00`);
    const dayOfWeek = new Date(Date.UTC(Number(dateParts.year), Number(dateParts.month) - 1, Number(dateParts.day))).getUTCDay();
    const startOfWeek = new Date(startOfToday.getTime() - ((dayOfWeek + 6) % 7) * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(`${dateParts.year}-${dateParts.month}-01T00:00:00+02:00`);
    const [totalUsers, signupsToday, signupsThisWeek, signupsThisMonth, activeUsersToday, activeUsersThisWeek, activeUsersThisMonth, openIssueReports, recentIssues, securityAlertsToday, securityAlertsThisWeek, securityAlertsThisMonth, recentSecurityAlerts, accountsWithRepeatedFailedLogins, panicAlertsToday, panicAlertsThisWeek, panicAlertsThisMonth, activePanicAlerts, recentPanicAlerts, databaseStats] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ lastLoginRecorded: true, lastLogin: { $gte: startOfToday } }),
      User.countDocuments({ lastLoginRecorded: true, lastLogin: { $gte: startOfWeek } }),
      User.countDocuments({ lastLoginRecorded: true, lastLogin: { $gte: startOfMonth } }),
      GoodsOrder.aggregate([{ $unwind: '$issueReports' }, { $match: { 'issueReports.status': 'Open' } }, { $count: 'count' }]),
      GoodsOrder.find({ issueReports: { $elemMatch: { status: 'Open' } } }).select('title buyer seller issueReports').populate('buyer', 'username email').populate('seller', 'username email').sort({ updatedAt: -1 }).limit(20).lean(),
      Notification.countDocuments({ type: 'security', title: 'Unsuccessful sign-in attempts', createdAt: { $gte: startOfToday } }),
      Notification.countDocuments({ type: 'security', title: 'Unsuccessful sign-in attempts', createdAt: { $gte: startOfWeek } }),
      Notification.countDocuments({ type: 'security', title: 'Unsuccessful sign-in attempts', createdAt: { $gte: startOfMonth } }),
      Notification.find({ type: 'security', title: 'Unsuccessful sign-in attempts' }).select('userId title message createdAt').populate('userId', 'username email').sort({ createdAt: -1 }).limit(10).lean(),
      User.countDocuments({ loginFailureCount: { $gte: 3 } }),
      SOSAlert.countDocuments({ triggeredAt: { $gte: startOfToday } }),
      SOSAlert.countDocuments({ triggeredAt: { $gte: startOfWeek } }),
      SOSAlert.countDocuments({ triggeredAt: { $gte: startOfMonth } }),
      SOSAlert.countDocuments({ status: 'active' }),
      SOSAlert.find().select('user alertCode latitude longitude mapUrl status triggeredAt closedAt').populate('user', 'username email').sort({ triggeredAt: -1 }).limit(10).lean(),
      mongoose.connection.db ? mongoose.connection.db.stats().catch(() => null) : Promise.resolve(null),
    ]);
    const issueCount = openIssueReports?.[0]?.count || 0;
    const openReports = recentIssues.flatMap((order) => (order.issueReports || [])
      .filter((issue) => issue.status === 'Open')
      .map((issue) => {
        const reporterIsBuyer = String(issue.reporter) === String(order.buyer?._id);
        const reportedUser = reporterIsBuyer ? order.seller : order.buyer;
        return {
          id: `${order._id}-${issue._id}`,
          category: issue.category,
          details: issue.details,
          createdAt: issue.createdAt,
          orderTitle: order.title,
          reporter: reporterIsBuyer ? order.buyer : order.seller,
          reportedUser,
        };
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    const megabytes = (bytes) => Number(((bytes || 0) / (1024 * 1024)).toFixed(2));
    res.json({
      success: true,
      reportGeneratedAt: now.toISOString(),
      dayStartsAt: startOfToday.toISOString(),
      periods: {
        today: { startsAt: startOfToday.toISOString(), endsAt: now.toISOString() },
        thisWeek: { startsAt: startOfWeek.toISOString(), endsAt: now.toISOString() },
        thisMonth: { startsAt: startOfMonth.toISOString(), endsAt: now.toISOString() },
      },
      users: { total: totalUsers, signupsToday, signupsThisWeek, signupsThisMonth },
      logins: { uniqueUsersToday: activeUsersToday, uniqueUsersThisWeek: activeUsersThisWeek, uniqueUsersThisMonth: activeUsersThisMonth },
      storage: databaseStats ? {
        database: databaseStats.db || mongoose.connection.name,
        dataMB: megabytes(databaseStats.dataSize),
        indexesMB: megabytes(databaseStats.indexSize),
        allocatedMB: megabytes(databaseStats.storageSize),
        source: 'MongoDB database statistics; does not include Firebase Storage files.',
      } : null,
      reports: { openMarketplaceIssues: issueCount, recentMarketplaceIssues: openReports, directUserReportsAvailable: false },
      security: {
        recordedAlertsToday: securityAlertsToday,
        recordedAlertsThisWeek: securityAlertsThisWeek,
        recordedAlertsThisMonth: securityAlertsThisMonth,
        accountsWith3OrMoreFailedLogins: accountsWithRepeatedFailedLogins,
        recentAlerts: recentSecurityAlerts.map((alert) => ({ id: alert._id, user: alert.userId, title: alert.title, message: alert.message, createdAt: alert.createdAt })),
      },
      panicAlerts: {
        active: activePanicAlerts,
        today: panicAlertsToday,
        thisWeek: panicAlertsThisWeek,
        thisMonth: panicAlertsThisMonth,
        recent: recentPanicAlerts.map((alert) => ({ id: alert._id, user: alert.user, code: alert.alertCode, mapUrl: alert.mapUrl, status: alert.status, triggeredAt: alert.triggeredAt, closedAt: alert.closedAt })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
    const pageSize = 50;
    const [total, users] = await Promise.all([
      User.countDocuments(),
      User.find({}, 'username email avatar location offeringType isVerified lastLogin lastLoginRecorded createdAt shareActivityWithAdmins shareDetailedActivityWithAdmins accountStatus accountStatusNote shareLoginGpsArea')
        .sort({ lastLoginRecorded: -1, lastLogin: -1, createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    ]);
    const ids = users.map((user) => user._id);
    if (!ids.length) return res.json({ success: true, page, pageSize, total, users: [] });

    const aggregateOwnerCounts = (Model, ownerExpression, match) => Model.aggregate([
      { $match: match },
      { $addFields: { __ownerId: ownerExpression } },
      { $match: { __ownerId: { $in: ids } } },
      { $group: { _id: '$__ownerId', count: { $sum: 1 } } },
    ]);
    const [listingCounts, serviceCounts, helperCounts, saleCounts, eventCounts, shopCounts, activity, loginAreas] = await Promise.all([
      aggregateOwnerCounts(Listing, '$userRef', { userRef: { $in: ids } }),
      aggregateOwnerCounts(Service, { $ifNull: ['$userRef', '$creator'] }, { $or: [{ userRef: { $in: ids } }, { creator: { $in: ids } }] }),
      aggregateOwnerCounts(Helper, { $ifNull: ['$userRef', '$creator'] }, { $or: [{ userRef: { $in: ids } }, { creator: { $in: ids } }] }),
      aggregateOwnerCounts(Sell, '$creator', { creator: { $in: ids } }),
      aggregateOwnerCounts(Event, '$userRef', { userRef: { $in: ids } }),
      Shop.aggregate([{ $match: { ownerId: { $in: ids.map(String) } } }, { $group: { _id: '$ownerId', count: { $sum: 1 } } }]),
      UserSectionActivity.find({ userId: { $in: ids } }).select('userId section createdAt').sort({ createdAt: -1 }).lean(),
      UserLoginArea.find({ userId: { $in: ids } }).select('userId latitude longitude capturedAt').lean(),
    ]);
    const mapCounts = (rows) => new Map(rows.map((row) => [String(row._id), row.count]));
    const counts = [listingCounts, serviceCounts, helperCounts, saleCounts, eventCounts, shopCounts].map(mapCounts);
    const latestActivity = new Map();
    activity.forEach((entry) => { if (!latestActivity.has(String(entry.userId))) latestActivity.set(String(entry.userId), entry); });
    const loginAreaByUser = new Map(loginAreas.map((entry) => [String(entry.userId), entry]));
    const enriched = users.map((user) => {
      const id = String(user._id);
      const postCounts = {
        listings: counts[0].get(id) || 0,
        services: counts[1].get(id) || 0,
        helpers: counts[2].get(id) || 0,
        itemsForSale: counts[3].get(id) || 0,
        events: counts[4].get(id) || 0,
        shops: counts[5].get(id) || 0,
      };
      const recent = user.shareActivityWithAdmins ? latestActivity.get(id) : null;
      const loginArea = user.shareLoginGpsArea ? loginAreaByUser.get(id) : null;
      return {
        ...user,
        postCounts,
        totalPosts: Object.values(postCounts).reduce((sum, count) => sum + count, 0),
        recentSection: recent ? { section: recent.section, viewedAt: recent.createdAt } : null,
        loginArea: loginArea ? { latitude: loginArea.latitude, longitude: loginArea.longitude, capturedAt: loginArea.capturedAt } : null,
      };
    });
    return res.json({ success: true, page, pageSize, total, users: enriched });
  } catch (error) {
    return next(error);
  }
};

export const getAdminPerformance = async (req, res, next) => {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [optedInUsers, suspendedOwnerIds] = await Promise.all([
      User.find({ shareActivityWithAdmins: true }).distinct('_id'),
      getSuspendedOwnerIds(),
    ]);
    const excludeSuspended = (...fields) => suspendedOwnerIds.length
      ? { $nor: fields.map((field) => ({ [field]: { $in: suspendedOwnerIds } })) }
      : {};
    const excludeSuspendedShops = suspendedOwnerIds.length
      ? { $nor: [{ ownerId: { $in: suspendedOwnerIds.map(String) } }] }
      : {};
    const [activityRows, propertyPosts, servicePosts, helperPosts, foodShops, eventPosts, salePosts, bookingRows, foodReservations, foodOrders, goodsRequests] = await Promise.all([
      optedInUsers.length ? UserSectionActivity.aggregate([
        { $match: { userId: { $in: optedInUsers }, createdAt: { $gte: since } } },
        { $group: { _id: '$section', count: { $sum: 1 }, durationSeconds: { $sum: '$durationSeconds' } } },
      ]) : Promise.resolve([]),
      Listing.countDocuments({ $and: [{ listingType: 'property' }, excludeSuspended('userRef')] }),
      Service.countDocuments(excludeSuspended('userRef', 'creator')),
      Helper.countDocuments(excludeSuspended('userRef', 'creator')),
      Shop.countDocuments(excludeSuspendedShops),
      Event.countDocuments(excludeSuspended('userRef')),
      Sell.countDocuments(excludeSuspended('creator')),
      Booking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $project: { category: { $switch: { branches: [
          { case: { $eq: [{ $type: '$listing' }, 'objectId'] }, then: 'Property' },
          { case: { $eq: [{ $type: '$service' }, 'objectId'] }, then: 'Services' },
          { case: { $eq: [{ $type: '$helper' }, 'objectId'] }, then: 'Helpers' },
          { case: { $eq: [{ $type: '$event' }, 'objectId'] }, then: 'Events' },
        ], default: 'Other' } } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      TableBooking.countDocuments({ createdAt: { $gte: since } }),
      FoodOrder.countDocuments({ createdAt: { $gte: since } }),
      GoodsOrder.countDocuments({ createdAt: { $gte: since } }),
    ]);
    const sectionCounts = Object.fromEntries(activityRows.map(({ _id, count }) => [_id, count]));
    const sectionSeconds = Object.fromEntries(activityRows.map(({ _id, durationSeconds = 0 }) => [_id, durationSeconds]));
    const sectionTime = (key) => Math.round(((sectionSeconds[key] || 0) / 60) * 10) / 10;
    const bookingCounts = Object.fromEntries(bookingRows.map(({ _id, count }) => [_id, count]));
    const categories = [
      { key: 'Food', label: 'Food', activity: (sectionCounts.Food || 0) + (sectionCounts.Shops || 0), activeMinutes: sectionTime('Food') + sectionTime('Shops'), posts: foodShops, bookings: foodReservations, orders: foodOrders },
      { key: 'Property', label: 'Property', activity: sectionCounts.Property || 0, activeMinutes: sectionTime('Property'), posts: propertyPosts, bookings: bookingCounts.Property || 0, orders: null },
      { key: 'Services', label: 'Services', activity: sectionCounts.Services || 0, activeMinutes: sectionTime('Services'), posts: servicePosts, bookings: bookingCounts.Services || 0, orders: null },
      { key: 'Helpers', label: 'Helpers', activity: sectionCounts.Helpers || 0, activeMinutes: sectionTime('Helpers'), posts: helperPosts, bookings: bookingCounts.Helpers || 0, orders: null },
      { key: 'Events', label: 'Events', activity: sectionCounts.Events || 0, activeMinutes: sectionTime('Events'), posts: eventPosts, bookings: bookingCounts.Events || 0, orders: null },
      { key: 'Sell', label: 'Items for sale', activity: sectionCounts.Sell || 0, activeMinutes: sectionTime('Sell'), posts: salePosts, bookings: null, orders: goodsRequests },
      { key: 'LegacyListings', label: 'Older, unclassified listing activity', activity: sectionCounts.Listings || 0, activeMinutes: sectionTime('Listings'), posts: null, bookings: null, orders: null },
      { key: 'Other', label: 'Other app sections', activity: ['Home', 'Search', 'Bookings', 'Messages', 'Profile', 'Other'].reduce((sum, key) => sum + (sectionCounts[key] || 0), 0), activeMinutes: ['Home', 'Search', 'Bookings', 'Messages', 'Profile', 'Other'].reduce((sum, key) => sum + sectionTime(key), 0), posts: null, bookings: null, orders: null },
    ];
    return res.json({ success: true, generatedAt: now.toISOString(), period: { startsAt: since.toISOString(), endsAt: now.toISOString() }, activityAvailable: optedInUsers.length > 0, timeAvailable: categories.some((category) => category.activeMinutes > 0), activityOptedInUsers: optedInUsers.length, activityNote: 'Sampled section activity and visible-tab time from users who opted in; it does not count individual clicks. Active-time collection starts with this update. Older Listings activity is kept unclassified because the previous tracker combined property and sale pages.', postsNote: 'Current post records visible to users; content owned by suspended accounts is excluded. Food counts shops.', bookingsNote: 'Booking requests created in the last 30 days, including all statuses; Food counts restaurant reservations. The orders series counts food orders in Food and item purchase requests in Items for sale, including all statuses.', categories });
  } catch (error) { return next(error); }
};

export const setActivitySharing = async (req, res, next) => {
  try {
    if (typeof req.body?.enabled !== 'boolean') return res.status(400).json({ success: false, message: 'Choose whether to share section activity.' });
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { shareActivityWithAdmins: req.body.enabled } }, { new: true }).select('shareActivityWithAdmins');
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    if (!req.body.enabled) await UserSectionActivity.deleteMany({ userId: user._id });
    return res.json({ success: true, enabled: user.shareActivityWithAdmins });
  } catch (error) {
    return next(error);
  }
};

export const setLoginAreaSharing = async (req, res, next) => {
  try {
    if (typeof req.body?.enabled !== 'boolean') return res.status(400).json({ success: false, message: 'Choose whether to share your approximate login area.' });
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { shareLoginGpsArea: req.body.enabled } }, { new: true }).select('shareLoginGpsArea');
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    if (!req.body.enabled) await UserLoginArea.deleteOne({ userId: user._id });
    return res.json({ success: true, enabled: user.shareLoginGpsArea });
  } catch (error) {
    return next(error);
  }
};

export const recordLoginArea = async (req, res, next) => {
  try {
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: 'A valid GPS area is required.' });
    }
    const user = await User.findById(req.user.id).select('shareLoginGpsArea');
    if (!user?.shareLoginGpsArea) return res.status(403).json({ success: false, message: 'Enable approximate login-area sharing in Profile settings first.' });
    const roundedLatitude = Math.round(latitude * 100) / 100;
    const roundedLongitude = Math.round(longitude * 100) / 100;
    const capturedAt = new Date();
    await UserLoginArea.findOneAndUpdate(
      { userId: user._id },
      { $set: { latitude: roundedLatitude, longitude: roundedLongitude, capturedAt, expiresAt: new Date(capturedAt.getTime() + 30 * 24 * 60 * 60 * 1000) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

export const setDetailedActivitySharing = async (req, res, next) => {
  try {
    if (typeof req.body?.enabled !== 'boolean') return res.status(400).json({ success: false, message: 'Choose whether to share detailed activity history.' });
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { shareDetailedActivityWithAdmins: req.body.enabled } }, { new: true }).select('shareDetailedActivityWithAdmins');
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    if (!req.body.enabled) await UserActivityHistory.deleteMany({ userId: user._id });
    return res.json({ success: true, enabled: user.shareDetailedActivityWithAdmins });
  } catch (error) { return next(error); }
};

export const recordDetailedUserActivity = async (req, res, next) => {
  try {
    const allowedActions = ['page_view', 'search_submitted', 'booking_started', 'booking_submitted', 'property_listing_started', 'service_listing_started', 'helper_listing_started', 'sale_item_started', 'listing_step_completed', 'listing_published', 'food_order_submitted', 'table_reservation_submitted', 'item_request_submitted', 'profile_updated'];
    const allowedSections = ['Home', 'Search', 'Listings', 'Property', 'Services', 'Helpers', 'Food', 'Shops', 'Events', 'Bookings', 'Messages', 'Sell', 'Profile', 'Other'];
    const allowedWorkflows = ['property', 'service', 'helper', 'sale', 'food', 'booking', 'profile'];
    const allowedSteps = ['category', 'details', 'pricing', 'availability', 'photos', 'review', 'submitted'];
    const { action, section, pageKey, workflow, step } = req.body || {};
    if (!allowedActions.includes(action) || !allowedSections.includes(section)) return res.status(400).json({ success: false, message: 'Unsupported activity event.' });
    const allowedPages = ['home', 'search', 'property', 'service', 'helper', 'food', 'shop', 'event', 'booking', 'messages', 'profile', 'sell', 'other'];
    if (pageKey !== undefined && !allowedPages.includes(pageKey)) return res.status(400).json({ success: false, message: 'Unsupported activity page.' });
    if (action === 'page_view' && !allowedPages.includes(pageKey)) return res.status(400).json({ success: false, message: 'A supported activity page is required.' });
    if (workflow !== undefined && !allowedWorkflows.includes(workflow)) return res.status(400).json({ success: false, message: 'Unsupported activity workflow.' });
    if (step !== undefined && !allowedSteps.includes(step)) return res.status(400).json({ success: false, message: 'Unsupported workflow step.' });
    if ((action === 'listing_step_completed' || action === 'listing_published') && (!['property', 'service', 'helper', 'sale'].includes(workflow) || (!step && action === 'listing_step_completed'))) return res.status(400).json({ success: false, message: 'A supported listing workflow and step are required.' });
    const user = await User.findById(req.user.id).select('shareDetailedActivityWithAdmins');
    if (!user?.shareDetailedActivityWithAdmins) return res.status(204).end();
    await UserActivityHistory.create({ userId: user._id, action, section, ...(pageKey ? { pageKey } : {}), ...(workflow ? { workflow } : {}), ...(step ? { step } : {}) });
    return res.status(204).end();
  } catch (error) { return next(error); }
};

export const getAdminUserActivityHistory = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) return res.status(400).json({ success: false, message: 'Choose a valid user.' });
    const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
    const pageSize = 100;
    const user = await User.findById(req.params.userId).select('shareDetailedActivityWithAdmins').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User account not found.' });
    if (!user.shareDetailedActivityWithAdmins) return res.json({ success: true, enabled: false, total: 0, page, pageSize, events: [] });
    const [total, events] = await Promise.all([
      UserActivityHistory.countDocuments({ userId: req.params.userId }),
      UserActivityHistory.find({ userId: req.params.userId }).select('section action pageKey workflow step createdAt').sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    ]);
    return res.json({ success: true, enabled: true, total, page, pageSize, events });
  } catch (error) { return next(error); }
};

export const updateAdminUserStatus = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body || {};
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ success: false, message: 'Choose activate or suspend.' });
    if (String(req.user.id) === String(req.params.userId)) return res.status(400).json({ success: false, message: 'You cannot suspend your own administrator account.' });
    const target = await User.findById(req.params.userId).select('email username accountStatus');
    if (!target) return res.status(404).json({ success: false, message: 'User account not found.' });
    if (isLoopOutAdminEmail(target.email)) return res.status(403).json({ success: false, message: 'Administrator accounts cannot be suspended from this dashboard.' });
    target.accountStatus = status;
    target.accountStatusChangedAt = new Date();
    target.accountStatusChangedBy = req.user.id;
    target.accountStatusNote = String(note).trim().slice(0, 500);
    await target.save();
    invalidateAccountStatusCache(target._id);
    invalidateSuspendedOwnerCache();
    await Notification.create({
      userId: target._id,
      type: 'system',
      title: status === 'suspended' ? 'Account temporarily suspended' : 'Account access restored',
      message: status === 'suspended'
        ? `An administrator suspended access to your LoopOut account.${target.accountStatusNote ? ` Reason: ${target.accountStatusNote}` : ''} Contact LoopOut support if you need help.`
        : 'An administrator restored access to your LoopOut account.',
      data: { accountStatus: status },
    });
    return res.json({ success: true, user: { _id: target._id, accountStatus: target.accountStatus, accountStatusNote: target.accountStatusNote } });
  } catch (error) {
    return next(error);
  }
};

export const recordUserSectionActivity = async (req, res, next) => {
  try {
    const allowedSections = ['Home', 'Search', 'Listings', 'Property', 'Services', 'Helpers', 'Food', 'Shops', 'Events', 'Bookings', 'Sell', 'Messages', 'Profile', 'Other'];
    if (!allowedSections.includes(req.body?.section)) return res.status(400).json({ success: false, message: 'Choose a supported LoopOut section.' });
    const user = await User.findById(req.user.id).select('shareActivityWithAdmins');
    if (!user?.shareActivityWithAdmins) return res.status(204).end();
    if (req.body?.sessionId !== undefined) {
      const sessionId = String(req.body.sessionId || '');
      if (!/^[a-zA-Z0-9-]{8,80}$/.test(sessionId)) return res.status(400).json({ success: false, message: 'Invalid activity session.' });
      const seconds = Number(req.body.durationSeconds);
      if (!Number.isFinite(seconds) || seconds < 0 || seconds > 30) return res.status(400).json({ success: false, message: 'Active time updates must be between 0 and 30 seconds.' });
      const now = new Date();
      if (seconds === 0) {
        await UserSectionActivity.findOneAndUpdate(
          { userId: user._id, sessionId },
          { $setOnInsert: { section: req.body.section, lastSeenAt: now } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } else {
        await UserSectionActivity.findOneAndUpdate(
          { userId: user._id, sessionId, lastSeenAt: { $lte: new Date(now.getTime() - 25000) } },
          { $inc: { durationSeconds: seconds }, $set: { lastSeenAt: now } },
          { new: true }
        );
      }
      return res.status(204).end();
    }
    const recent = await UserSectionActivity.findOne({ userId: user._id }).sort({ createdAt: -1 }).select('section createdAt').lean();
    const secondsSinceLastEvent = recent ? Date.now() - new Date(recent.createdAt).getTime() : Infinity;
    if (secondsSinceLastEvent < 30 || (recent?.section === req.body.section && secondsSinceLastEvent < 10 * 60 * 1000)) return res.status(204).end();
    await UserSectionActivity.create({ userId: user._id, section: req.body.section });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

// Cities we actively track — must line up with the coverage used by search
// (see controllers/searchController.js CITY_ALIASES) so the numbers we show
// on the homepage reflect areas the platform actually serves.
const TRACKED_CITIES = [
  { key: 'JHB', label: 'Johannesburg', match: /johannesburg|sandton|randburg|midrand|soweto|roodepoort/i },
  { key: 'PTA', label: 'Pretoria', match: /pretoria|centurion|soshanguve|mamelodi/i },
  { key: 'CPT', label: 'Cape Town', match: /cape town|bellville|stellenbosch|somerset west/i },
  { key: 'PLK', label: 'Polokwane', match: /polokwane|seshego|mankweng|mokopane/i },
];

const round1 = (n) => Math.round(n * 10) / 10;

// Turns a raw count into a rounded, human-friendly label like "1.2k+" or "48".
const formatCount = (n) => {
  if (n >= 1000) return `${round1(n / 1000)}k+`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
  return `${n}`;
};

export const getHomeStats = async (req, res, next) => {
  try {
    const [
      verifiedHostCount,
      listingCount,
      serviceCount,
      helperCount,
      completedBookingCount,
      ratingAgg,
      listingAddresses,
      serviceAddresses,
      helperAddresses,
    ] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Listing.countDocuments(),
      Service.countDocuments(),
      Helper.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
      Listing.find({}, 'address').lean(),
      Service.find({}, 'address').lean(),
      Helper.find({}, 'address').lean(),
    ]);

    const avgRating = ratingAgg?.[0]?.avg ? round1(ratingAgg[0].avg) : null;
    const totalListedItems = listingCount + serviceCount + helperCount;

    const allAddresses = [
      ...listingAddresses.map((l) => l.address),
      ...serviceAddresses.map((s) => s.address),
      ...helperAddresses.map((h) => h.address),
    ].filter(Boolean);

    const cities = TRACKED_CITIES.map(({ key, label, match }) => {
      const count = allAddresses.filter((addr) => match.test(addr)).length;
      return {
        city: key,
        label,
        status: count > 0 ? 'Live' : 'Coming soon',
        count: formatCount(count),
        rawCount: count,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        verifiedHosts: { value: formatCount(verifiedHostCount), raw: verifiedHostCount },
        avgRating: { value: avgRating ? `${avgRating}★` : 'New', raw: avgRating },
        completedBookings: { value: formatCount(completedBookingCount), raw: completedBookingCount },
        totalListings: { value: formatCount(totalListedItems), raw: totalListedItems },
        cities,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getServerStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalSignups,
      verifiedUsers,
      signupsToday,
      signupsThisWeek,
      signupsThisMonth,
      loginsToday,
      loginsThisWeek,
      loginsThisMonth,
      listingCount,
      serviceCount,
      helperCount,
      eventCount,
      bookingCount,
      messageCount,
      commentCount,
      shopCount,
      recentSignups,
      recentLogins,
      dbStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastLoginRecorded: true, lastLogin: { $gte: startOfToday } }),
      User.countDocuments({ lastLoginRecorded: true, lastLogin: { $gte: sevenDaysAgo } }),
      User.countDocuments({ lastLoginRecorded: true, lastLogin: { $gte: thirtyDaysAgo } }),
      Listing.countDocuments().catch(() => 0),
      Service.countDocuments().catch(() => 0),
      Helper.countDocuments().catch(() => 0),
      mongoose.connection.collection('events').countDocuments().catch(() => 0),
      Booking.countDocuments().catch(() => 0),
      mongoose.connection.collection('messages').countDocuments().catch(() => 0),
      mongoose.connection.collection('comments').countDocuments().catch(() => 0),
      mongoose.connection.collection('shops').countDocuments().catch(() => 0),
      User.find({}, 'username email avatar createdAt isVerified')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      User.find({ lastLoginRecorded: true, lastLogin: { $ne: null } }, 'username email avatar lastLogin isVerified')
        .sort({ lastLogin: -1 })
        .limit(6)
        .lean(),
      mongoose.connection.db ? mongoose.connection.db.stats().catch(() => ({ storageSize: 0, dataSize: 0 })) : { storageSize: 0, dataSize: 0 },
    ]);

    const storageSizeMB = Number(((dbStats?.storageSize || 0) / (1024 * 1024)).toFixed(2));
    const dataSizeMB = Number(((dbStats?.dataSize || 0) / (1024 * 1024)).toFixed(2));
    const freeTierLimitMB = 512;
    const freeSpaceMB = Number(Math.max(0, freeTierLimitMB - storageSizeMB).toFixed(2));
    const percentUsed = Number(((storageSizeMB / freeTierLimitMB) * 100).toFixed(2));

    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

    const memoryUsage = process.memoryUsage();
    const memoryRSS_MB = Number((memoryUsage.rss / (1024 * 1024)).toFixed(1));
    const memoryHeap_MB = Number((memoryUsage.heapUsed / (1024 * 1024)).toFixed(1));

    const data = {
      success: true,
      timestamp: new Date().toISOString(),
      users: {
        totalSignups,
        verifiedUsers,
        unverifiedUsers: totalSignups - verifiedUsers,
        signupsToday,
        signupsThisWeek,
        signupsThisMonth,
        recentSignups,
      },
      logins: {
        loginsToday,
        loginsThisWeek,
        loginsThisMonth,
        recentLogins,
      },
      storage: {
        provider: 'MongoDB Atlas (M0 Free Tier)',
        storageUsedMB: storageSizeMB,
        dataSizeMB,
        totalLimitMB: freeTierLimitMB,
        freeSpaceMB,
        percentUsed: `${percentUsed}%`,
        percentFree: `${(100 - percentUsed).toFixed(2)}%`,
      },
      platformStats: {
        listings: listingCount,
        services: serviceCount,
        helpers: helperCount,
        events: eventCount,
        bookings: bookingCount,
        messages: messageCount,
        comments: commentCount,
        shops: shopCount,
      },
      serverHealth: {
        uptime: `${uptimeHours}h ${uptimeMinutes}m (${uptimeSeconds}s)`,
        memoryUsage: `${memoryRSS_MB} MB (Heap: ${memoryHeap_MB} MB)`,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
    };

    if (req.query.format === 'json') return res.status(200).json(data);

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LoopOut - Server & Analytics Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(22, 27, 46, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --primary: #3b82f6;
      --accent: #10b981;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', -apple-system, sans-serif;
      background: radial-gradient(circle at top right, #1e1b4b 0%, #0b0f19 50%, #030712 100%);
      color: var(--text);
      min-height: 100vh;
      padding: 32px 20px;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      gap: 16px;
    }
    .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .logo span { color: #60a5fa; }
    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .badge-live::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-bottom: 26px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 22px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .card-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); margin-bottom: 8px; }
    .card-val { font-size: 34px; font-weight: 800; color: #fff; margin-bottom: 6px; }
    .card-sub { font-size: 13px; color: var(--text-muted); }
    .progress-bar-bg {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      overflow: hidden;
      margin: 12px 0 6px;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      border-radius: 6px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin: 28px 0 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .table-card { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; }
    td { padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    .pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .pill-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .pill-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .footer { margin-top: 40px; text-align: center; color: var(--text-muted); font-size: 12px; }
    .json-link { color: #60a5fa; text-decoration: none; font-weight: 600; }
    .json-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="logo">Loop<span>Out</span> Server & Analytics</div>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Live health, capacity and user metrics</div>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <a href="?format=json" class="json-link">View Raw JSON</a>
        <div class="badge-live">System Online</div>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <div class="card-title">Total Signups</div>
        <div class="card-val">${data.users.totalSignups}</div>
        <div class="card-sub">${data.users.verifiedUsers} verified (${data.users.unverifiedUsers} pending)</div>
      </div>

      <div class="card">
        <div class="card-title">Logins / Active</div>
        <div class="card-val">${data.logins.loginsToday} <span style="font-size: 16px; font-weight: 500; color: #9ca3af;">today</span></div>
        <div class="card-sub">${data.logins.loginsThisWeek} active this week · ${data.logins.loginsThisMonth} this month</div>
      </div>

      <div class="card">
        <div class="card-title">Database Storage Left</div>
        <div class="card-val" style="color: #34d399;">${data.storage.freeSpaceMB} <span style="font-size: 16px; font-weight: 500;">MB</span></div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${data.storage.percentUsed};"></div>
        </div>
        <div class="card-sub">${data.storage.storageUsedMB} MB used of 512 MB (${data.storage.percentFree} free)</div>
      </div>

      <div class="card">
        <div class="card-title">Server Health & RAM</div>
        <div class="card-val">${data.serverHealth.memoryUsage.split(' ')[0]} <span style="font-size: 16px; font-weight: 500;">MB</span></div>
        <div class="card-sub">Uptime: ${data.serverHealth.uptime} · Node ${data.serverHealth.nodeVersion}</div>
      </div>
    </div>

    <div class="section-title">📦 Platform Content</div>
    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Listings</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.listings}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Helpers</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.helpers}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Services</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.services}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Bookings</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.bookings}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Messages</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.messages}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div class="card-title">Comments</div>
        <div class="card-val" style="font-size: 26px;">${data.platformStats.comments}</div>
      </div>
    </div>

    <div class="section-title">👥 Recently Registered Users</div>
    <div class="card table-card">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Registered At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.users.recentSignups.map(u => `
            <tr>
              <td style="font-weight: 600;">${u.username || 'Anonymous'}</td>
              <td style="color: var(--text-muted);">${u.email || '-'}</td>
              <td>${u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
              <td><span class="pill ${u.isVerified ? 'pill-green' : 'pill-blue'}">${u.isVerified ? 'Verified' : 'Pending'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      LoopOut Home & Services · Server time: ${new Date().toLocaleString()} · Auto-refreshed live from MongoDB Atlas
    </div>
  </div>
</body>
</html>
      `);
    }

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
