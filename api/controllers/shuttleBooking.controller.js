import crypto from 'crypto';
import ShuttleBooking from '../models/shuttleBooking.model.js';
import Shuttle from '../models/shuttle.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';
import { advanceShuttleDeparture, hasExplicitShuttleSchedule } from '../utils/shuttleTripLifecycle.js';

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

    let shuttle = await Shuttle.findById(shuttleId);
    shuttle = await advanceShuttleDeparture(shuttle);
    if (!shuttle || !hasExplicitShuttleSchedule(shuttle) || !shuttle.active || shuttle.driverLicenceScan === SEEDED_SAMPLE_SCAN_URL || shuttle.driverVerificationStatus === 'rejected' || !['scheduled', 'boarding'].includes(shuttle.currentStatus)) {
      return next(errorHandler(404, 'Shuttle route not found or is no longer active.'));
    }
    if (shuttle.driverVerificationStatus === 'rejected') {
      return next(errorHandler(404, 'Shuttle route not found or is no longer active.'));
    }

    // Normalize seat numbers (e.g. 'Seat 1' -> '1', 1 -> '1')
    const normalizedInputSeats = Array.isArray(seatNumbers)
      ? seatNumbers.map((s) => String(s).replace(/\D/g, '').trim()).filter(Boolean)
      : undefined;

    const effectiveSeatNumbers = (Array.isArray(normalizedInputSeats) && normalizedInputSeats.length > 0)
      ? normalizedInputSeats
      : (Array.isArray(seatNumbers) ? seatNumbers : undefined);

    const requestedSeatsCount = Number(seatsBooked) || (Array.isArray(effectiveSeatNumbers) ? effectiveSeatNumbers.length : 1);
    if (!Number.isInteger(requestedSeatsCount) || requestedSeatsCount <= 0 || requestedSeatsCount > shuttle.totalSeats) {
      return next(errorHandler(400, 'Please select at least 1 seat.'));
    }
    if (Array.isArray(effectiveSeatNumbers) && (effectiveSeatNumbers.length !== requestedSeatsCount || new Set(effectiveSeatNumbers.map(String)).size !== effectiveSeatNumbers.length || effectiveSeatNumbers.some((seat) => !/^[1-9]\d*$/.test(String(seat)) || Number(seat) > shuttle.totalSeats))) {
      return next(errorHandler(400, 'Select a valid, unique seat for each passenger.'));
    }

    if (shuttle.availableSeats < requestedSeatsCount) {
      return next(errorHandler(400, `Only ${shuttle.availableSeats} seat(s) available on this trip.`));
    }

    // Check if any requested seats are already booked
    if (Array.isArray(effectiveSeatNumbers) && effectiveSeatNumbers.length > 0) {
      const activeBookings = await ShuttleBooking.find({
        shuttleRef: shuttle._id,
        status: { $in: ['pending_approval', 'approved', 'payment_reported', 'paid'] },
      }).select('seatNumbers');

      const alreadyBooked = new Set();
      activeBookings.forEach((b) => {
        if (Array.isArray(b.seatNumbers)) {
          b.seatNumbers.forEach((s) => alreadyBooked.add(s));
        }
      });

      const clash = effectiveSeatNumbers.find((s) => alreadyBooked.has(s));
      if (clash) {
        return next(errorHandler(400, `Seat ${clash} is already occupied. Please pick another seat.`));
      }
    }

    const reservationFilter = { _id: shuttle._id, active: true, currentStatus: { $in: ['scheduled', 'boarding'] }, availableSeats: { $gte: requestedSeatsCount } };
    const normalizedSeats = Array.isArray(effectiveSeatNumbers) ? effectiveSeatNumbers.map(String) : [];
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
      seatNumbers: Array.isArray(effectiveSeatNumbers) ? effectiveSeatNumbers : [],
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
      if (reservedShuttle.availableSeats <= 0) {
        await Shuttle.findOneAndUpdate(
          { _id: shuttle._id, active: true, currentStatus: { $in: ['scheduled', 'boarding'] }, availableSeats: { $lte: 0 } },
          { $set: { currentStatus: 'en_route', departedAt: new Date() } }
        );
      }
    } catch (saveError) {
      await Shuttle.findByIdAndUpdate(shuttle._id, {
        $inc: { availableSeats: requestedSeatsCount },
        ...(normalizedSeats.length ? { $pull: { reservedSeatNumbers: { $in: normalizedSeats } } } : {}),
      });
      throw saveError;
    }

    // Persist a LoopOut notification; the notification model also sends registered-device push alerts.
    try {
      await Notification.create({
        userId: shuttle.driverRef,
        type: 'shuttle',
        title: 'New Shuttle Booking Request',
        message: `${booking.passengerName} requested ${requestedSeatsCount} seat(s)${extraBags > 0 ? ` + ${extraBags} extra bag(s)` : ''} from ${shuttle.originCity} to ${shuttle.destinationCity} at R${totalPrice}. Open Driver Request Desk and tap Accept, Decline, or Refer.`,
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
          route: `/shuttles?tab=driver-desk&bookingId=${savedBooking._id}`,
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

const getMatchingReferralShuttles = async (booking, originalShuttle) => {
  const departure = new Date(originalShuttle.departureDate);
  const dayStart = new Date(Date.UTC(departure.getUTCFullYear(), departure.getUTCMonth(), departure.getUTCDate()));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const exactCity = (city) => new RegExp(`^${String(city || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  return Shuttle.find({
    _id: { $ne: originalShuttle._id },
    driverRef: { $ne: booking.driverRef },
    active: true,
    departureDate: { $gte: dayStart, $lt: dayEnd },
    originCity: exactCity(originalShuttle.originCity),
    destinationCity: exactCity(originalShuttle.destinationCity),
    pricePerSeat: Number(originalShuttle.pricePerSeat),
    extraBagPrice: Number(originalShuttle.extraBagPrice) || 0,
    availableSeats: { $gte: booking.seatsBooked },
    driverLicenceScan: { $ne: SEEDED_SAMPLE_SCAN_URL },
    driverVerificationStatus: { $ne: 'rejected' },
  })
    .select('_id driverName carType carColor plateNumber totalSeats availableSeats departureDate departureTime pricePerSeat driverRating driverRatingCount +reservedSeatNumbers')
    .sort({ driverRating: -1, createdAt: -1 })
    .limit(20)
    .lean();
};

// Drivers can only refer a pending request to an available shuttle with the same route, date and fare.
export const getBookingReferralOptions = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id).populate('shuttleRef');
    if (!booking) return next(errorHandler(404, 'Booking request not found.'));
    if (String(booking.driverRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Only the assigned driver can refer this request.'));
    }
    if (booking.status !== 'pending_approval') {
      return next(errorHandler(409, 'Only pending requests can be referred.'));
    }
    if (!booking.shuttleRef) return next(errorHandler(404, 'The shuttle for this request is no longer available.'));
    if ((booking.referralCount || 0) >= 3) {
      return next(errorHandler(409, 'This request has reached the referral limit.'));
    }

    const shuttles = await getMatchingReferralShuttles(booking, booking.shuttleRef);
    return res.status(200).json({ success: true, shuttles });
  } catch (error) {
    next(error);
  }
};

// Transfer an unapproved request to another matching driver without changing the passenger's quoted fare.
export const referBooking = async (req, res, next) => {
  try {
    const { shuttleId } = req.body;
    if (!shuttleId) return next(errorHandler(400, 'Choose a shuttle to refer this request to.'));

    const booking = await ShuttleBooking.findById(req.params.id).populate('shuttleRef');
    if (!booking) return next(errorHandler(404, 'Booking request not found.'));
    if (String(booking.driverRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Only the assigned driver can refer this request.'));
    }
    if (booking.status !== 'pending_approval') {
      return next(errorHandler(409, 'Only pending requests can be referred.'));
    }
    if (!booking.shuttleRef) return next(errorHandler(404, 'The shuttle for this request is no longer available.'));
    if ((booking.referralCount || 0) >= 3) {
      return next(errorHandler(409, 'This request has reached the referral limit.'));
    }

    const originalShuttle = booking.shuttleRef;
    const originalShuttleId = originalShuttle._id;
    const candidateShuttles = await getMatchingReferralShuttles(booking, originalShuttle);
    const targetShuttle = candidateShuttles.find((candidate) => String(candidate._id) === String(shuttleId));
    if (!targetShuttle) {
      return next(errorHandler(409, 'That shuttle is no longer available or does not match this route, date and fare. Refresh the referral list.'));
    }

    const occupiedSeatNumbers = new Set((targetShuttle.reservedSeatNumbers || []).map(String));
    const activeTargetBookings = await ShuttleBooking.find({
      shuttleRef: targetShuttle._id,
      status: { $in: ['pending_approval', 'approved', 'payment_reported', 'paid'] },
    }).select('seatNumbers').lean();
    activeTargetBookings.forEach((activeBooking) => {
      (activeBooking.seatNumbers || []).forEach((seat) => occupiedSeatNumbers.add(String(seat)));
    });

    const seatsBooked = Number(booking.seatsBooked) || 1;
    const targetSeatNumbers = booking.seatNumbers?.length
      ? Array.from({ length: targetShuttle.totalSeats }, (_, index) => String(index + 1))
          .filter((seat) => !occupiedSeatNumbers.has(seat))
          .slice(0, seatsBooked)
      : [];
    if (booking.seatNumbers?.length && targetSeatNumbers.length !== seatsBooked) {
      return next(errorHandler(409, 'The selected shuttle no longer has enough unreserved numbered seats.'));
    }

    const reservationFilter = { _id: targetShuttle._id, active: true, availableSeats: { $gte: seatsBooked } };
    const reservationUpdate = { $inc: { availableSeats: -seatsBooked } };
    if (targetSeatNumbers.length) {
      reservationFilter.reservedSeatNumbers = { $nin: targetSeatNumbers };
      reservationUpdate.$addToSet = { reservedSeatNumbers: { $each: targetSeatNumbers } };
    }
    const reservedTarget = await Shuttle.findOneAndUpdate(reservationFilter, reservationUpdate, { new: true });
    if (!reservedTarget) return next(errorHandler(409, 'Seats on that shuttle were just reserved. Refresh and choose another.'));

    const previousDriverId = booking.driverRef;
    const saved = await ShuttleBooking.findOneAndUpdate(
      { _id: booking._id, status: 'pending_approval', driverRef: previousDriverId, shuttleRef: originalShuttleId },
      {
        $set: { shuttleRef: targetShuttle._id, driverRef: targetShuttle.driverRef, ...(targetSeatNumbers.length ? { seatNumbers: targetSeatNumbers } : {}) },
        $inc: { referralCount: 1 },
        $push: { referralHistory: { fromDriverRef: previousDriverId, toDriverRef: targetShuttle.driverRef, fromShuttleRef: originalShuttleId, toShuttleRef: targetShuttle._id, referredAt: new Date() } },
      },
      { new: true }
    );

    if (!saved) {
      await Shuttle.findByIdAndUpdate(targetShuttle._id, {
        $inc: { availableSeats: seatsBooked },
        ...(targetSeatNumbers.length ? { $pull: { reservedSeatNumbers: { $in: targetSeatNumbers } } } : {}),
      });
      return next(errorHandler(409, 'This request has already changed. Refresh the driver desk and try again.'));
    }

    await releaseReservedSeats({ ...booking.toObject(), shuttleRef: originalShuttleId });

    try {
      await Notification.create({
        userId: targetShuttle.driverRef,
        type: 'shuttle',
        title: 'Shuttle Request Referred to You',
        message: `${booking.passengerName} was referred to your shuttle for ${originalShuttle.originCity} → ${originalShuttle.destinationCity}. Open Driver Request Desk and tap Accept, Decline, or Refer. The fare remains R${booking.totalPrice}.`,
        data: { bookingId: saved._id, shuttleId: targetShuttle._id, passengerName: booking.passengerName, seatsBooked, totalPrice: booking.totalPrice, ticketCode: booking.ticketCode, route: `/shuttles?tab=driver-desk&bookingId=${saved._id}` },
      });
      await Notification.create({
        userId: booking.passengerRef,
        type: 'shuttle',
        title: 'Your Shuttle Request Was Referred',
        message: `Your request was referred to another driver for ${originalShuttle.originCity} → ${originalShuttle.destinationCity}. The quoted fare remains R${booking.totalPrice}; the new driver still needs to accept your request.`,
        data: { bookingId: saved._id, shuttleId: targetShuttle._id, seatsBooked, totalPrice: booking.totalPrice, route: '/shuttles?tab=my-tickets' },
      });
    } catch (notifErr) {
      console.warn('Referral notification error:', notifErr.message);
    }

    return res.status(200).json({ success: true, message: 'Request referred. The new driver has been asked to accept or decline it.', booking: saved });
  } catch (error) {
    next(error);
  }
};

// Passenger reports a payment sent; the driver must still verify bank receipt.
export const reportPayment = async (req, res, next) => {
  try {
    const booking = await ShuttleBooking.findById(req.params.id).populate('shuttleRef');
    if (!booking) return next(errorHandler(404, 'Booking not found.'));
    if (String(booking.passengerRef) !== String(req.user.id)) {
      return next(errorHandler(403, 'Only the passenger who booked can report this payment.'));
    }
    if (booking.status === 'payment_reported') {
      return res.status(200).json({ success: true, message: 'You already reported this payment. The driver still needs to confirm receipt.', booking });
    }
    if (booking.status !== 'approved') {
      return next(errorHandler(409, 'The driver must approve this trip before you can report payment.'));
    }
    if (booking.paymentDeadline && new Date() > new Date(booking.paymentDeadline)) {
      booking.status = 'cancelled';
      await booking.save();
      await releaseReservedSeats(booking);
      return next(errorHandler(400, 'The payment deadline has passed. Contact the driver before sending money.'));
    }

    const paymentReportedAt = new Date();
    const saved = await ShuttleBooking.findOneAndUpdate(
      { _id: booking._id, passengerRef: req.user.id, status: 'approved' },
      { $set: { status: 'payment_reported', paymentReportedAt, paymentReportedMethod: 'EFT / Bank transfer' } },
      { new: true }
    );
    if (!saved) return next(errorHandler(409, 'This booking changed. Refresh your shuttle tickets and try again.'));

    try {
      await Notification.create({
        userId: booking.driverRef,
        type: 'shuttle',
        title: 'Passenger reports payment sent',
        message: `${booking.passengerName} reports sending R${booking.totalPrice} by EFT for ${booking.shuttleRef?.originCity || ''} → ${booking.shuttleRef?.destinationCity || ''}. Check your bank account, then confirm receipt in the Driver Request Desk. The passenger's ticket is not active until you confirm.`,
        data: {
          bookingId: saved._id,
          shuttleId: booking.shuttleRef?._id,
          passengerName: booking.passengerName,
          passengerPhone: booking.passengerPhone,
          totalPrice: booking.totalPrice,
          paymentReportedAt,
          paymentReportedMethod: saved.paymentReportedMethod,
          ticketCode: booking.ticketCode,
          route: `/shuttles?tab=driver-desk&bookingId=${saved._id}`,
        },
      });
    } catch (notificationError) {
      console.warn('Driver payment report notification failed:', notificationError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment report sent to the driver. Your ticket will activate after they confirm the funds arrived.',
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

    if (!['approved', 'payment_reported'].includes(booking.status)) {
      return next(errorHandler(400, 'Trip must be approved before payment can be confirmed.'));
    }

    // Check if 24-hour window has expired
    if (booking.status === 'approved' && booking.paymentDeadline && new Date() > new Date(booking.paymentDeadline)) {
      booking.status = 'cancelled';
      await booking.save();
      // Release seats
      await releaseReservedSeats(booking);
      return next(errorHandler(400, 'Payment deadline (24 hours) has expired.'));
    }

    const { paymentMethod } = req.body;
    booking.status = 'paid';
    booking.paidAt = new Date();
    booking.paymentMethod = paymentMethod || (booking.paymentReportedMethod
      ? `${booking.paymentReportedMethod} (Confirmed by Driver)`
      : 'Direct EFT / Bank Transfer (Confirmed by Driver)');
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
      delete booking.referralHistory;
      if (!booking.shuttleRef) return booking;
      const shuttle = { ...booking.shuttleRef };
      delete shuttle.driverLicenceScan;
      delete shuttle.driverIdScan;
      delete shuttle.driverFaceScan;
      delete shuttle.driverLicenceNumber;
      if (!['approved', 'payment_reported', 'paid'].includes(booking.status)) {
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

    if (booking.status !== 'completed') {
      return next(errorHandler(400, 'You can rate the driver after the shuttle trip is completed.'));
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
