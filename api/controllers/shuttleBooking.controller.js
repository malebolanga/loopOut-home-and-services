import crypto from 'crypto';
import ShuttleBooking from '../models/shuttleBooking.model.js';
import Shuttle from '../models/shuttle.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

// Generate clean booking ticket code (e.g. SHTL-8B29X)
const generateTicketCode = () => {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SHTL-${hex}`;
};

// 1. Create a seat booking request (User requests seat like a bus)
export const createBookingRequest = async (req, res, next) => {
  try {
    const passengerId = req.user.id;
    const {
      shuttleId,
      passengerName,
      passengerPhone,
      passengerEmail,
      seatsBooked,
      seatNumbers,
      pickupLocation,
      dropoffLocation,
      passengerNotes,
      extraBagsCount,  // number of EXTRA bags beyond the 1 free bag
    } = req.body;

    if (!shuttleId) {
      return next(errorHandler(400, 'Shuttle ID is required.'));
    }

    const shuttle = await Shuttle.findById(shuttleId);
    if (!shuttle || !shuttle.active) {
      return next(errorHandler(404, 'Shuttle route not found or is no longer active.'));
    }

    const requestedSeatsCount = Number(seatsBooked) || (Array.isArray(seatNumbers) ? seatNumbers.length : 1);
    if (requestedSeatsCount <= 0) {
      return next(errorHandler(400, 'Please select at least 1 seat.'));
    }

    if (shuttle.availableSeats < requestedSeatsCount) {
      return next(errorHandler(400, `Only ${shuttle.availableSeats} seat(s) available on this trip.`));
    }

    // Check if any requested seats are already booked
    if (Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      const activeBookings = await ShuttleBooking.find({
        shuttleRef: shuttle._id,
        status: { $in: ['pending_approval', 'approved', 'paid'] },
      }).select('seatNumbers');

      const alreadyBooked = new Set();
      activeBookings.forEach((b) => {
        if (Array.isArray(b.seatNumbers)) {
          b.seatNumbers.forEach((s) => alreadyBooked.add(s));
        }
      });

      const clash = seatNumbers.find((s) => alreadyBooked.has(s));
      if (clash) {
        return next(errorHandler(400, `Seat ${clash} is already occupied. Please pick another seat.`));
      }
    }

    // ── Price calculation ────────────────────────────────────────
    // Rule: 1 normal bag FREE per passenger. Extra bags cost extraBagPrice each.
    const seatCharge = requestedSeatsCount * (shuttle.pricePerSeat || 150);
    const extraBags = Math.max(0, Number(extraBagsCount) || 0);
    const bagPriceEach = Number(shuttle.extraBagPrice) || 0;

    // Validate extra bags limit
    const maxExtra = Number(shuttle.maxExtraBagsPerPassenger) || 2;
    if (extraBags > maxExtra * requestedSeatsCount) {
      return next(errorHandler(400, `Maximum ${maxExtra} extra bag(s) per passenger. For ${requestedSeatsCount} passenger(s) that is ${maxExtra * requestedSeatsCount} extra bag(s) total.`));
    }

    const luggageCharge = extraBags * bagPriceEach;
    const totalPrice = seatCharge + luggageCharge;

    const user = await User.findById(passengerId);

    const booking = new ShuttleBooking({
      shuttleRef: shuttle._id,
      passengerRef: passengerId,
      driverRef: shuttle.driverRef,
      passengerName: passengerName || user?.name || user?.username || 'Passenger',
      passengerPhone: passengerPhone || user?.phone || '',
      passengerEmail: passengerEmail || user?.email || '',
      seatsBooked: requestedSeatsCount,
      seatNumbers: Array.isArray(seatNumbers) ? seatNumbers : [],
      totalPrice,
      pickupLocation: pickupLocation || shuttle.pickupStation,
      dropoffLocation: dropoffLocation || shuttle.dropoffStation,
      passengerNotes: passengerNotes || '',
      extraBagsCount: extraBags,
      luggageCharge,
      seatCharge,
      status: 'pending_approval',
      ticketCode: generateTicketCode(),
    });

    const savedBooking = await booking.save();

    // Decrement available seats so others cannot overbook
    shuttle.availableSeats = Math.max(0, shuttle.availableSeats - requestedSeatsCount);
    await shuttle.save();

    // Notify Driver via LoopOut In-App Notification
    try {
      await Notification.create({
        userId: shuttle.driverRef,
        type: 'booking',
        title: 'New Shuttle Pickup Request 🚐',
        message: `${booking.passengerName} requested pickup at "${booking.pickupLocation || shuttle.originCity}" (${requestedSeatsCount} seat(s)${extraBags > 0 ? ` + ${extraBags} extra bag(s)` : ''}) for ${shuttle.originCity} → ${shuttle.destinationCity}. Fare: R${totalPrice}.`,
        data: {
          bookingId: savedBooking._id,
          shuttleId: shuttle._id,
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          passengerPhone: booking.passengerPhone,
          route: '/shuttles?tab=driver-desk',
        },
      });
    } catch (notifErr) {
      console.warn('Notification failed:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Pickup requested successfully! Driver notified on LoopOut and WhatsApp.',
      booking: savedBooking,
      driverPhone: shuttle.driverPhone || '',
      driverName: shuttle.driverName || 'Verified Driver',
    });
  } catch (error) {
    next(error);
  }
};

// 2. Driver approves passenger request -> triggers 24-hour payment deadline!
export const approveBooking = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id).populate('shuttleRef');
    if (!booking) return next(errorHandler(404, 'Booking request not found.'));

    if (String(booking.driverRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Only the driver can approve this booking.'));
    }

    if (booking.status !== 'pending_approval') {
      return next(errorHandler(400, `Cannot approve booking with status: ${booking.status}`));
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 24 hours

    booking.status = 'approved';
    booking.approvedAt = now;
    booking.paymentDeadline = deadline;

    const saved = await booking.save();

    // Send high-priority notification to passenger
    try {
      await Notification.create({
        userId: booking.passengerRef,
        type: 'booking',
        title: 'Trip Approved! Pay within 24 hours 🕒',
        message: `Your trip on ${booking.shuttleRef?.carType || 'Shuttle'} was approved! You have 24 hours to complete payment and secure your seat.`,
        data: {
          bookingId: saved._id,
          shuttleId: booking.shuttleRef?._id,
          route: '/shuttles?tab=my-tickets',
        },
      });
    } catch (notifErr) {
      console.warn('Passenger notification error:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Booking approved! Passenger notified to pay within 24 hours.',
      booking: saved,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Driver declines booking request
export const declineBooking = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id);
    if (!booking) return next(errorHandler(404, 'Booking not found.'));

    if (String(booking.driverRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Unauthorized to decline this booking.'));
    }

    const { reason } = req.body;
    booking.status = 'declined';
    booking.declineReason = reason || 'Trip fully booked or route unavailable';
    const saved = await booking.save();

    // Release seats back
    await Shuttle.findByIdAndUpdate(booking.shuttleRef, {
      $inc: { availableSeats: booking.seatsBooked || 1 },
    });

    try {
      await Notification.create({
        userId: booking.passengerRef,
        type: 'booking',
        title: 'Shuttle Request Declined',
        message: `Your seat request was declined by the driver: ${booking.declineReason}`,
        data: { bookingId: saved._id, route: '/shuttles' },
      });
    } catch (notifErr) {
      console.warn('Decline notification error:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Booking request declined.',
      booking: saved,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Passenger pays within the 24-hour window
export const payBooking = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id).populate('shuttleRef');
    if (!booking) return next(errorHandler(404, 'Booking not found.'));

    if (String(booking.passengerRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Unauthorized to pay for this booking.'));
    }

    if (booking.status === 'paid') {
      return res.status(200).json({ success: true, message: 'Already paid.', booking });
    }

    if (booking.status !== 'approved') {
      return next(errorHandler(400, 'Trip must be approved by driver before payment.'));
    }

    // Check if 24-hour window has expired
    if (booking.paymentDeadline && new Date() > new Date(booking.paymentDeadline)) {
      booking.status = 'cancelled';
      await booking.save();
      // Release seats
      await Shuttle.findByIdAndUpdate(booking.shuttleRef?._id, {
        $inc: { availableSeats: booking.seatsBooked || 1 },
      });
      return next(errorHandler(400, 'Payment deadline (24 hours) has expired. Please rebook your seat.'));
    }

    const { paymentMethod } = req.body;
    booking.status = 'paid';
    booking.paidAt = new Date();
    booking.paymentMethod = paymentMethod || 'LoopPay / Instant EFT';
    if (!booking.ticketCode) {
      booking.ticketCode = generateTicketCode();
    }

    const saved = await booking.save();

    // Notify driver of confirmed payment
    try {
      await Notification.create({
        userId: booking.driverRef,
        type: 'payment',
        title: 'Shuttle Seat Paid & Confirmed! 💳',
        message: `${booking.passengerName} paid R${booking.totalPrice} for ${booking.seatsBooked} seat(s). Ticket: ${booking.ticketCode}`,
        data: {
          bookingId: saved._id,
          route: '/shuttles?tab=driver-bookings',
        },
      });
    } catch (notifErr) {
      console.warn('Driver paid notification error:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Seat confirmed & paid successfully! Your boarding ticket is ready.',
      booking: saved,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Cancel booking (Passenger cancels)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id);
    if (!booking) return next(errorHandler(404, 'Booking not found.'));

    if (String(booking.passengerRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Unauthorized to cancel this booking.'));
    }

    if (booking.status === 'cancelled') {
      return res.status(200).json({ success: true, message: 'Already cancelled.', booking });
    }

    // If seats were reserved, release them
    if (['pending_approval', 'approved', 'paid'].includes(booking.status)) {
      await Shuttle.findByIdAndUpdate(booking.shuttleRef, {
        $inc: { availableSeats: booking.seatsBooked || 1 },
      });
    }

    booking.status = 'cancelled';
    const saved = await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled.',
      booking: saved,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Get Passenger Bookings
export const getPassengerBookings = async (req, res, next) => {
  try {
    const bookings = await ShuttleBooking.find({ passengerRef: req.user.id })
      .populate('shuttleRef')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get Driver Bookings (Requests for this driver's shuttles)
export const getDriverBookings = async (req, res, next) => {
  try {
    const bookings = await ShuttleBooking.find({ driverRef: req.user.id })
      .populate('shuttleRef')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};
