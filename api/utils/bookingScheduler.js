import Booking from '../models/Booking.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Event from '../models/event.model.js';

/**
 * Periodically processes reminders and auto-cancellations
 */
export const checkBookingsAndActions = async () => {
  try {
    const now = new Date();
    
    // -------------------------------------------------------------
    // TASK 1: REMINDER DISPATCHER (6 Hours Before booking starts)
    // -------------------------------------------------------------
    const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    
    // Find bookings starting within the next 6 hours that haven't been reminded yet
    const upcomingBookings = await Booking.find({
      startDate: { $gt: now, $lte: sixHoursLater },
      status: { $in: ['pending', 'confirmed', 'approved', 'assigned', 'enroute', 'ongoing'] },
      reminderSent: { $ne: true }
    })
    .populate('user')
    .populate('listing')
    .populate('helper')
    .populate('service')
    .populate('event');

    for (const booking of upcomingBookings) {
      if (!booking.user) continue;

      const item = booking.listing || booking.helper || booking.service || booking.event;
      const itemName = item ? item.name || item.title : 'Service Request';
      const hoursRemaining = Math.max(1, Math.round((new Date(booking.startDate).getTime() - now.getTime()) / (1000 * 60 * 60)));
      const formattedDate = new Date(booking.startDate).toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      const formattedTime = new Date(booking.startDate).toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const username = booking.user.username || 'User';

      // 1. Create a local system notification
      const localNotification = new Notification({
        userId: booking.user._id,
        type: 'booking',
        title: `⏰ Reminder: ${hoursRemaining} Hours Left`,
        message: `Hi ${username}, your appointment for "${itemName}" is coming up in ${hoursRemaining} hours (${formattedTime} on ${formattedDate}).`,
        data: { bookingId: booking._id, type: 'reminder' }
      });
      await localNotification.save();

      // Mark the in-app reminder as sent. External WhatsApp delivery is not
      // advertised until a real provider has been configured.
      booking.reminderSent = true;
      await booking.save();
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
