import crypto from 'crypto';
import ShuttleBooking from '../models/shuttleBooking.model.js';
import Shuttle from '../models/shuttle.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

const SEEDED_SAMPLE_SCAN_URL = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=compress&cs=tinysrgb&w=600';

// Generate clean booking ticket code (e.g. SHTL-8B29X)
const generateTicketCode = () => {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SHTL-${hex}`;
};

const releaseReservedSeats = async (booking) => {
  const update = { $inc: { availableSeats: booking.seatsBooked || 1 } };
  if (booking.seatNumbers?.length) update.$pull = { reservedSeatNumbers: { $in: booking.seatNumbers.map(String) } };
  await Shuttle.findByIdAndUpdate(booking.shuttleRef?._id || booking.shuttleRef, update);
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
      pickupCoordinates,
      dropoffLocation,
      passengerNotes,
      extraBagsCount,  // number of EXTRA bags beyond the 1 free bag
    } = req.body;

    if (!shuttleId) {
      return next(errorHandler(400, 'Shuttle ID is required.'));
    }

    const shuttle = await Shuttle.findById(shuttleId);
    if (!shuttle || !shuttle.active || shuttle.driverLicenceScan === SEEDED_SAMPLE_SCAN_URL || shuttle.driverVerificationStatus === 'rejected' || new Date(shuttle.departureDate) < new Date()) {
      return next(errorHandler(404, 'Shuttle route not found or is no longer active.'));
    }
    if (shuttle.driverVerificationStatus === 'rejected') {
      return next(errorHandler(404, 'Shuttle route not found or is no longer active.'));
    }

    const requestedSeatsCount = Number(seatsBooked) || (Array.isArray(seatNumbers) ? seatNumbers.length : 1);
    if (!Number.isInteger(requestedSeatsCount) || requestedSeatsCount <= 0 || requestedSeatsCount > shuttle.totalSeats) {
      return next(errorHandler(400, 'Please select at least 1 seat.'));
    }
    if (Array.isArray(seatNumbers) && (seatNumbers.length !== requestedSeatsCount || new Set(seatNumbers.map(String)).size !== seatNumbers.length || seatNumbers.some((seat) => !/^[1-9]\d*$/.test(String(seat)) || Number(seat) > shuttle.totalSeats))) {
      return next(errorHandler(400, 'Select a valid, unique seat for each passenger.'));
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

    const reservationFilter = { _id: shuttle._id, active: true, availableSeats: { $gte: requestedSeatsCount } };
    const normalizedSeats = Array.isArray(seatNumbers) ? seatNumbers.map(String) : [];
    const reservationUpdate = { $inc: { availableSeats: -requestedSeatsCount } };
    if (normalizedSeats.length) {
      reservationFilter.reservedSeatNumbers = { $nin: normalizedSeats };
      reservationUpdate.$addToSet = { reservedSeatNumbers: { $each: normalizedSeats } };
    }
    const reservedShuttle = await Shuttle.findOneAndUpdate(reservationFilter, reservationUpdate, { new: true });
    if (!reservedShuttle) return next(errorHandler(409, 'Those seats were just reserved. Refresh the seat map and choose again.'));

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
      pickupCoordinates: pickupCoordinates && pickupCoordinates.lat ? {
        lat: Number(pickupCoordinates.lat),
        lng: Number(pickupCoordinates.lng),
      } : null,
      dropoffLocation: dropoffLocation || shuttle.dropoffStation,
      passengerNotes: passengerNotes || '',
      extraBagsCount: extraBags,
      luggageCharge,
      seatCharge,
      status: 'pending_approval',
      ticketCode: generateTicketCode(),
    });

    let savedBooking;
    try {
      savedBooking = await booking.save();
    } catch (saveError) {
      await Shuttle.findByIdAndUpdate(shuttle._id, {
        $inc: { availableSeats: requestedSeatsCount },
        ...(normalizedSeats.length ? { $pull: { reservedSeatNumbers: { $in: normalizedSeats } } } : {}),
      });
      throw saveError;
    }

    // Notify Driver via LoopOut In-App Notification
    try {
      await Notification.create({
        userId: shuttle.driverRef,
        type: 'shuttle',
        title: 'New Shuttle Pickup Request 🚐',
        message: `${booking.passengerName} requested pickup at "${booking.pickupLocation || shuttle.originCity}" (${requestedSeatsCount} seat(s)${extraBags > 0 ? ` + ${extraBags} extra bag(s)` : ''}) for ${shuttle.originCity} → ${shuttle.destinationCity}. Fare: R${totalPrice}.`,
        data: {
          bookingId: savedBooking._id,
          shuttleId: shuttle._id,
          plateNumber: shuttle.plateNumber,
          carType: shuttle.carType,
          carColor: shuttle.carColor,
          passengerName: booking.passengerName,
          passengerPhone: booking.passengerPhone,
          seatsBooked: requestedSeatsCount,
          extraBagsCount: extraBags,
          totalPrice,
          seatCharge,
          luggageCharge,
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          originCity: shuttle.originCity,
          destinationCity: shuttle.destinationCity,
          ticketCode: savedBooking.ticketCode,
          route: '/shuttles?tab=driver-desk',
        },
      });
    } catch (notifErr) {
      console.warn('Notification failed:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Pickup request sent to the driver in LoopOut.',
      booking: savedBooking,
      driverName: shuttle.driverName || 'LoopOut driver',
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

    // Send high-priority notification to passenger with driver bank details
    try {
      await Notification.create({
        userId: booking.passengerRef,
        type: 'shuttle',
        title: '✅ Trip Approved! Send EFT to Driver 🕒',
        message: `Your ${booking.seatsBooked} seat(s) on ${booking.shuttleRef?.carType || 'Shuttle'} (${booking.shuttleRef?.plateNumber || ''}) ${booking.shuttleRef?.originCity} → ${booking.shuttleRef?.destinationCity} were approved! Transfer R${booking.totalPrice} directly to the driver's bank account within 24 hours. Once the driver confirms receipt on LoopOut, your boarding ticket is ready.`,
        data: {
          bookingId: saved._id,
          shuttleId: booking.shuttleRef?._id,
          plateNumber: booking.shuttleRef?.plateNumber,
          carType: booking.shuttleRef?.carType,
          carColor: booking.shuttleRef?.carColor,
          driverName: booking.shuttleRef?.driverName,
          driverPhone: booking.shuttleRef?.driverPhone,
          originCity: booking.shuttleRef?.originCity,
          destinationCity: booking.shuttleRef?.destinationCity,
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          seatsBooked: booking.seatsBooked,
          totalPrice: booking.totalPrice,
          ticketCode: booking.ticketCode,
          paymentDeadline: deadline,
          bankName: booking.shuttleRef?.bankName,
          bankAccountHolder: booking.shuttleRef?.bankAccountHolder || booking.shuttleRef?.driverName,
          bankAccountNumber: booking.shuttleRef?.bankAccountNumber,
          bankBranchCode: booking.shuttleRef?.bankBranchCode,
          bankAccountType: booking.shuttleRef?.bankAccountType,
          bankReference: booking.shuttleRef?.bankReference || booking.ticketCode,
          route: '/shuttles?tab=my-tickets',
        },
      });
    } catch (notifErr) {
      console.warn('Passenger notification error:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Booking approved! Passenger notified with your banking details to send EFT.',
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
    if (booking.status !== 'pending_approval') {
      return next(errorHandler(409, 'Only pending booking requests can be declined.'));
    }

    const { reason } = req.body;
    const declineReason = String(reason || 'Trip fully booked or route unavailable').slice(0, 300);
    const saved = await ShuttleBooking.findOneAndUpdate(
      { _id: booking._id, status: 'pending_approval' },
      { $set: { status: 'declined', declineReason } },
      { new: true }
    );
    if (!saved) return next(errorHandler(409, 'This booking request has already changed.'));
    await releaseReservedSeats(saved);

    try {
      await Notification.create({
        userId: booking.passengerRef,
        type: 'shuttle',
        title: '❌ Shuttle Request Declined',
        message: `Your seat request for ${booking.pickupLocation || 'your pickup'} was declined by the driver: ${booking.declineReason}`,
        data: { bookingId: saved._id, pickupLocation: booking.pickupLocation, dropoffLocation: booking.dropoffLocation, route: '/shuttles' },
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

// 4. Driver confirms passenger payment received via bank account / EFT
export const payBooking = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id).populate('shuttleRef');
    if (!booking) return next(errorHandler(404, 'Booking not found.'));

    // Only the driver (or admin) can confirm that payment was received
    if (String(booking.driverRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Only the driver can confirm that payment has been received in their bank account.'));
    }

    if (booking.status === 'paid') {
      return res.status(200).json({ success: true, message: 'Already confirmed as paid.', booking });
    }

    if (booking.status !== 'approved') {
      return next(errorHandler(400, 'Trip must be approved before payment can be confirmed.'));
    }

    // Check if 24-hour window has expired
    if (booking.paymentDeadline && new Date() > new Date(booking.paymentDeadline)) {
      booking.status = 'cancelled';
      await booking.save();
      // Release seats
      await releaseReservedSeats(booking);
      return next(errorHandler(400, 'Payment deadline (24 hours) has expired.'));
    }

    const { paymentMethod } = req.body;
    booking.status = 'paid';
    booking.paidAt = new Date();
    booking.paymentMethod = paymentMethod || 'Direct EFT / Bank Transfer (Confirmed by Driver)';
    if (!booking.ticketCode) {
      booking.ticketCode = generateTicketCode();
    }

    const saved = await booking.save();

    // Send high-priority notification to passenger that driver confirmed payment!
    try {
      await Notification.create({
        userId: booking.passengerRef,
        type: 'shuttle',
        title: '🎉 Payment Confirmed by Driver!',
        message: `Driver ${booking.shuttleRef?.driverName || 'Driver'} confirmed receipt of R${booking.totalPrice} for your ${booking.seatsBooked} seat(s) on ${booking.shuttleRef?.originCity || ''} → ${booking.shuttleRef?.destinationCity || ''}. Your ticket ${booking.ticketCode} is ready for boarding!`,
        data: {
          bookingId: saved._id,
          shuttleId: booking.shuttleRef?._id,
          plateNumber: booking.shuttleRef?.plateNumber,
          carType: booking.shuttleRef?.carType,
          carColor: booking.shuttleRef?.carColor,
          driverName: booking.shuttleRef?.driverName,
          driverPhone: booking.shuttleRef?.driverPhone,
          passengerName: booking.passengerName,
          seatsBooked: booking.seatsBooked,
          totalPrice: booking.totalPrice,
          ticketCode: booking.ticketCode,
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          originCity: booking.shuttleRef?.originCity,
          destinationCity: booking.shuttleRef?.destinationCity,
          paymentMethod: booking.paymentMethod,
          route: '/shuttles?tab=my-tickets',
        },
      });
    } catch (notifErr) {
      console.warn('Passenger paid confirmation notification error:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully! Passenger has been notified and their ticket is active.',
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
    if (!['pending_approval', 'approved', 'paid'].includes(booking.status)) {
      return next(errorHandler(409, 'This booking can no longer be cancelled.'));
    }

    const saved = await ShuttleBooking.findOneAndUpdate(
      { _id: booking._id, status: { $in: ['pending_approval', 'approved', 'paid'] } },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!saved) return next(errorHandler(409, 'This booking has already changed. Refresh and try again.'));
    await releaseReservedSeats(saved);

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
    const records = await ShuttleBooking.find({ passengerRef: req.user.id })
      .populate('shuttleRef')
      .sort({ createdAt: -1 })
      .lean();
    const bookings = records.map((booking) => {
      if (!booking.shuttleRef) return booking;
      const shuttle = { ...booking.shuttleRef };
      delete shuttle.driverLicenceScan;
      delete shuttle.driverIdScan;
      delete shuttle.driverFaceScan;
      delete shuttle.driverLicenceNumber;
      if (!['approved', 'paid'].includes(booking.status)) {
        delete shuttle.driverPhone;
        delete shuttle.bankAccountHolder;
        delete shuttle.bankName;
        delete shuttle.bankAccountNumber;
        delete shuttle.bankBranchCode;
        delete shuttle.bankAccountType;
        delete shuttle.bankReference;
      }
      return { ...booking, shuttleRef: shuttle };
    });

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

// 8. Passenger rates a completed or paid trip
// PUT /api/shuttle-bookings/rate/:id
export const rateTrip = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id);
    if (!booking) return next(errorHandler(404, 'Booking not found.'));

    if (String(booking.passengerRef) !== String(req.user.id)) {
      return next(errorHandler(403, 'Only the passenger who booked can rate this trip.'));
    }

    if (!['paid', 'completed'].includes(booking.status)) {
      return next(errorHandler(400, 'You can only rate trips that are paid or completed.'));
    }

    if (booking.passengerRating !== null && booking.passengerRating !== undefined) {
      return next(errorHandler(400, 'You have already rated this trip.'));
    }

    const { rating, review } = req.body;
    const stars = Number(rating);
    if (!stars || stars < 1 || stars > 5) {
      return next(errorHandler(400, 'Rating must be between 1 and 5 stars.'));
    }

    booking.passengerRating = stars;
    booking.passengerReview = (review || '').trim().slice(0, 400);
    booking.ratedAt = new Date();
    await booking.save();

    // Recalculate and persist driver rating on the shuttle doc
    try {
      const allRatings = await ShuttleBooking.find({
        shuttleRef: booking.shuttleRef,
        passengerRating: { $ne: null, $exists: true },
      }).select('passengerRating').lean();

      const totalStars = allRatings.reduce((sum, b) => sum + (b.passengerRating || 0), 0);
      const avgRating = allRatings.length > 0 ? Math.round((totalStars / allRatings.length) * 10) / 10 : 0;

      // Also count all completed/paid bookings for this driver to get real trip count
      const completedCount = await ShuttleBooking.countDocuments({
        driverRef: booking.driverRef,
        status: { $in: ['paid', 'completed'] },
      });

      await Shuttle.findByIdAndUpdate(booking.shuttleRef, {
        driverRating: avgRating,
        driverRatingCount: allRatings.length,
        completedTrips: completedCount,
      });
    } catch (statErr) {
      console.warn('Could not update driver stats:', statErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Thank you! Your ${stars}★ rating has been submitted.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
