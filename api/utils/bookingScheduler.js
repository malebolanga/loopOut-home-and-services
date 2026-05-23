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
    // TASK 1: REMINDER DISPATCHER (12 Hours Before booking starts)
    // -------------------------------------------------------------
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    
    // Find bookings starting within the next 12 hours that haven't been reminded yet
    const upcomingBookings = await Booking.find({
      startDate: { $gt: now, $lte: twelveHoursLater },
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
      
      const phoneNum = booking.phone || booking.user.phone || 'N/A';
      const username = booking.user.username || 'User';

      // 1. Create a local system notification
      const localNotification = new Notification({
        userId: booking.user._id,
        type: 'booking',
        title: '⏰ Upcoming Booking Reminder',
        message: `Hi ${username}, this is a reminder that you have a booking for "${itemName}" scheduled on ${formattedDate} at ${formattedTime}.`,
        data: { bookingId: booking._id, type: 'reminder' }
      });
      await localNotification.save();

      // 2. Simulate WhatsApp Reminder
      console.log('\n' + '💚'.repeat(30));
      console.log('✨  LOOP-OUT WHATSAPP GATEWAY (REMINDER SIMULATED)');
      console.log('💚'.repeat(30));
      console.log(`TO:       ${phoneNum} (${username})`);
      console.log(`SUBJECT:  Upcoming Booking Reminder`);
      console.log(`MESSAGE:  Hi ${username},\n          This is a friendly reminder that your booking for "${itemName}" is scheduled for:\n          📅 ${formattedDate}\n          ⏰ ${formattedTime}\n          We look forward to seeing you!`);
      console.log('💚'.repeat(30) + '\n');

      // 3. Mark reminder as sent
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

      const username = booking.user ? booking.user.username : 'User';
      const phoneNum = booking.phone || (booking.user ? booking.user.phone : 'N/A');

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

      // 2. Simulate WhatsApp Cancellation Notification
      console.log('\n' + '❤️'.repeat(30));
      console.log('✨  LOOP-OUT WHATSAPP GATEWAY (AUTO-CANCEL SIMULATED)');
      console.log('❤️'.repeat(30));
      console.log(`TO:       ${phoneNum} (${username})`);
      console.log(`SUBJECT:  Booking Automatically Cancelled`);
      console.log(`MESSAGE:  Hi ${username},\n          Your booking for "${itemName}" on ${formattedDate} has been automatically cancelled because the date has passed without it being marked as completed. It has been removed from the active calendar.`);
      console.log('❤️'.repeat(30) + '\n');
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
