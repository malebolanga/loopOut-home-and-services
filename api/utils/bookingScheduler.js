import Booking from '../models/Booking.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Event from '../models/event.model.js';
import { sendPushNotificationToUser } from './pushNotifications.js';

/**
 * Periodically processes reminders and auto-cancellations
 */
export const checkBookingsAndActions = async () => {
  try {
    const now = new Date();
    
    // -------------------------------------------------------------
    // TASK 1: REMIND BOTH BOOKING PARTIES AT 24, 8, AND 2 HOURS
    // -------------------------------------------------------------
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingBookings = await Booking.find({
      startDate: { $gt: now, $lte: oneDayLater },
      status: { $in: ['pending', 'confirmed', 'approved', 'assigned', 'enroute', 'ongoing'] }
    })
    .populate('user', 'username')
    .populate({ path: 'listing', populate: [{ path: 'userRef', select: 'username' }, { path: 'creator', select: 'username' }] })
    .populate({ path: 'helper', populate: { path: 'userRef', select: 'username' } })
    .populate({ path: 'service', populate: [{ path: 'userRef', select: 'username' }, { path: 'creator', select: 'username' }] })
    .populate({ path: 'event', populate: { path: 'userRef', select: 'username' } });

    for (const booking of upcomingBookings) {
      const item = booking.listing || booking.helper || booking.service || booking.event;
      const clientId = booking.user?._id?.toString();
      const provider = item?.userRef || item?.creator;
      const providerId = provider?._id?.toString();
      if (!clientId) continue;

      const timeUntilStartMs = new Date(booking.startDate).getTime() - now.getTime();
      const reminderStages = [
        { key: '24h', hours: 24, label: '24-hour' },
        { key: '8h', hours: 8, label: '8-hour' },
        { key: '2h', hours: 2, label: '2-hour' },
      ];
      // The scheduler runs every minute. A one-hour window around each milestone
      // avoids sending a "24-hour" reminder several hours early.
      const stage = reminderStages.find(({ hours }) =>
        timeUntilStartMs <= hours * 60 * 60 * 1000 && timeUntilStartMs > (hours - 1) * 60 * 60 * 1000
      );
      if (!stage || (booking.remindersSent || []).includes(stage.key)) continue;

      // Claim this stage atomically so duplicate API instances cannot send it twice.
      const claim = await Booking.updateOne(
        { _id: booking._id, status: { $in: ['pending', 'confirmed', 'approved', 'assigned', 'enroute', 'ongoing'] }, remindersSent: { $ne: stage.key } },
        { $addToSet: { remindersSent: stage.key } }
      );
      if (claim.modifiedCount !== 1) continue;

      const itemName = item ? item.name || item.title : 'Service Request';
      const providerName = provider?.username || item?.name || item?.title || 'your service provider';
      const clientName = booking.user?.username || 'the client';
      const formattedDate = new Date(booking.startDate).toLocaleDateString('en-ZA', {
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        timeZone: 'Africa/Johannesburg'
      });
      const formattedTime = new Date(booking.startDate).toLocaleTimeString('en-ZA', {
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Africa/Johannesburg'
      });
      const audience = new Map();
      audience.set(clientId, { userId: booking.user._id, role: 'client', name: clientName });
      if (providerId && !audience.has(providerId)) audience.set(providerId, { userId: provider._id, role: 'provider', name: providerName });

      const title = `⏰ ${stage.label} booking reminder`;
      const notifications = [...audience.values()].map((recipient) => {
        const message = recipient.role === 'provider'
          ? `You have a booking for "${itemName}" with ${clientName} at ${formattedTime} on ${formattedDate}.`
          : `Your booking for "${itemName}" with ${providerName} is at ${formattedTime} on ${formattedDate}.`;
        return {
          userId: recipient.userId,
          type: 'booking',
          title,
          message: `${message} This is your ${stage.label} reminder.`,
          data: { bookingId: booking._id, type: 'reminder', reminderStage: stage.key, audience: recipient.role }
        };
      });

      try {
        await Notification.insertMany(notifications);
      } catch (error) {
        await Booking.updateOne({ _id: booking._id }, { $pull: { remindersSent: stage.key } });
        console.error(`[BOOKING REMINDER] Could not save ${stage.key} reminder for ${booking._id}:`, error.message);
        continue;
      }

      const pushResults = await Promise.allSettled([...audience.values()].map((recipient) => {
        const notification = notifications.find((entry) => entry.data.audience === recipient.role);
        return sendPushNotificationToUser(recipient.userId, {
          title,
          body: notification.message,
          data: { bookingId: booking._id, type: 'booking', reminderStage: stage.key, route: '/notifications' },
        });
      }));
      pushResults.forEach((result) => {
        if (result.status === 'rejected') console.warn(`[BOOKING REMINDER] Push delivery failed for ${booking._id} (${stage.key}):`, result.reason?.message || result.reason);
      });
    }

    // -------------------------------------------------------------
    // TASK 2: AUTO-CANCELLATION (Date passed without completion)
    // -------------------------------------------------------------
    // Find bookings that have ended and are not completed, cancelled, or declined
    const expiredBookings = await Booking.find({
      endDate: { $lt: now },
      status: { $in: ['pending', 'confirmed', 'approved', 'assigned', 'enroute', 'ongoing'] }
    })
    .populate('user')
    .populate('listing')
    .populate('helper')
    .populate('service')
    .populate('event');

    for (const booking of expiredBookings) {
      const item = booking.listing || booking.helper || booking.service || booking.event;
      const itemName = item ? item.name || item.title : 'Service Request';
      const formattedDate = new Date(booking.startDate).toLocaleDateString('en-ZA', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });

      // Update status to cancelled
      booking.status = 'cancelled';
      await booking.save();

      // 1. Create a local system notification for cancellation
      if (booking.user) {
        const cancelNotification = new Notification({
          userId: booking.user._id,
          type: 'booking',
          title: '🚨 Booking Auto-Cancelled',
          message: `Your booking for "${itemName}" on ${formattedDate} has been automatically cancelled because it passed the end date without being marked as completed. It has been removed from your active calendar.`,
          data: { bookingId: booking._id, status: 'cancelled' }
        });
        await cancelNotification.save();
      }

    }

  } catch (error) {
    console.error('Error running booking scheduler:', error);
  }
};

/**
 * Initializes the background scheduler job
 */
export const initBookingScheduler = () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('🕒 loopOut Booking Scheduler bypass in test mode.');
    return;
  }

  console.log('🕒 Initializing loopOut Booking Background Scheduler...');
  
  // Run immediately on startup
  checkBookingsAndActions();

  // Run every 60 seconds (1 minute) to check for tasks promptly
  setInterval(checkBookingsAndActions, 60 * 1000);
};
