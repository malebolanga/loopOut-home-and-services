import Shuttle from '../models/shuttle.model.js';
import ShuttleBooking from '../models/shuttleBooking.model.js';

const isValidCoordinates = (coords) => coords?.lat !== null && coords?.lat !== undefined && coords?.lat !== ''
  && coords?.lng !== null && coords?.lng !== undefined && coords?.lng !== ''
  && Number.isFinite(Number(coords.lat))
  && Number.isFinite(Number(coords?.lng))
  && Number(coords.lat) >= -90 && Number(coords.lat) <= 90
  && Number(coords.lng) >= -180 && Number(coords.lng) <= 180;

export const distanceBetweenCoordinatesKm = (a, b) => {
  if (!isValidCoordinates(a) || !isValidCoordinates(b)) return null;
  const radians = (value) => value * Math.PI / 180;
  const latDistance = radians(Number(b.lat) - Number(a.lat));
  const lngDistance = radians(Number(b.lng) - Number(a.lng));
  const h = Math.sin(latDistance / 2) ** 2
    + Math.cos(radians(Number(a.lat))) * Math.cos(radians(Number(b.lat))) * Math.sin(lngDistance / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const getScheduledShuttleDeparture = (shuttle) => {
  if (!shuttle?.departureDate) return null;
  // Schedule dates are interpreted in South African local time (UTC+02:00).
  const datePart = new Date(new Date(shuttle.departureDate).getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const label = String(shuttle.departureTime || '').trim();
  // A newly opened return leg is bookable immediately; its driver sets the
  // departure later, so do not expire it based on the arrival date.
  if (shuttle.returnRouteFor && /^set by driver$/i.test(label)) return null;
  const match = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  // Older route records sometimes only said “When full”. Keep those available
  // through their listed date, then retire them instead of showing stale trips.
  if (!match) return new Date(`${datePart}T23:59:59+02:00`);

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (minutes > 59 || hours > (meridiem ? 12 : 23) || (meridiem && hours === 0)) return new Date(`${datePart}T23:59:59+02:00`);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const clock = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+02:00`;
  const departureAt = new Date(`${datePart}T${clock}`);
  return Number.isFinite(departureAt.getTime()) ? departureAt : null;
};

export const advanceShuttleDeparture = async (shuttle, now = new Date()) => {
  if (!shuttle || !['scheduled', 'boarding'].includes(shuttle.currentStatus)) return shuttle;
  const departureAt = getScheduledShuttleDeparture(shuttle);
  const isFull = Number(shuttle.availableSeats) <= 0;
  const timeReached = departureAt && departureAt <= now;
  const quickDeparture = /leaving now|boarding now/i.test(String(shuttle.departureTime || ''));
  if (!isFull && !timeReached && !quickDeparture) return shuttle;

  const originCoordinates = shuttle.currentCoordinates?.isLive === true && isValidCoordinates(shuttle.currentCoordinates)
    ? { lat: Number(shuttle.currentCoordinates.lat), lng: Number(shuttle.currentCoordinates.lng) }
    : shuttle.originCoordinates;
  return Shuttle.findOneAndUpdate(
    { _id: shuttle._id, active: true, currentStatus: { $in: ['scheduled', 'boarding'] } },
    { $set: { currentStatus: 'en_route', departedAt: now, ...(isValidCoordinates(originCoordinates) ? { originCoordinates } : {}) } },
    { new: true }
  ).lean();
};

export const finishShuttleTripAndCreateReturn = async (shuttleId, arrivalCoordinates, arrivedAt = new Date()) => {
  const shuttle = await Shuttle.findById(shuttleId).lean();
  if (!shuttle) return null;

  // Unique returnRouteFor makes arrival retries idempotent.
  let returnRoute = await Shuttle.findOne({ returnRouteFor: shuttle._id }).lean();
  if (!returnRoute) {
    const originCoordinates = isValidCoordinates(arrivalCoordinates)
      ? { lat: Number(arrivalCoordinates.lat), lng: Number(arrivalCoordinates.lng) }
      : shuttle.destinationCoordinates;
    const nextRoute = {
      returnRouteFor: shuttle._id,
      driverRef: shuttle.driverRef,
      driverName: shuttle.driverName,
      driverPhone: shuttle.driverPhone,
      driverAvatar: shuttle.driverAvatar,
      driverVerificationStatus: shuttle.driverVerificationStatus,
      bankAccountHolder: shuttle.bankAccountHolder,
      bankName: shuttle.bankName,
      bankAccountNumber: shuttle.bankAccountNumber,
      bankBranchCode: shuttle.bankBranchCode,
      bankAccountType: shuttle.bankAccountType,
      bankReference: shuttle.bankReference,
      driverRating: shuttle.driverRating,
      driverRatingCount: shuttle.driverRatingCount,
      completedTrips: shuttle.completedTrips,
      carType: shuttle.carType,
      plateNumber: shuttle.plateNumber,
      carColor: shuttle.carColor,
      carImages: shuttle.carImages,
      totalSeats: shuttle.totalSeats,
      availableSeats: shuttle.totalSeats,
      reservedSeatNumbers: [],
      serviceType: shuttle.serviceType,
      departureProvince: shuttle.destinationProvince,
      destinationProvince: shuttle.departureProvince,
      originCity: shuttle.destinationCity,
      destinationCity: shuttle.originCity,
      originCoordinates,
      destinationCoordinates: shuttle.originCoordinates || undefined,
      pickupStation: shuttle.dropoffStation || shuttle.destinationCity,
      dropoffStation: shuttle.pickupStation || shuttle.originCity,
      dropoffType: shuttle.dropoffType,
      isHouseToHouse: shuttle.isHouseToHouse,
      departureRule: 'when_full',
      leavesWhenFull: true,
      departureDate: arrivedAt,
      departureTime: 'Set by driver',
      estimatedArrival: shuttle.estimatedArrival,
      pricePerSeat: shuttle.pricePerSeat,
      freeBagsPerPassenger: shuttle.freeBagsPerPassenger,
      extraBagPrice: shuttle.extraBagPrice,
      maxExtraBagsPerPassenger: shuttle.maxExtraBagsPerPassenger,
      luggageNotes: shuttle.luggageNotes,
      currentStatus: 'scheduled',
      currentCoordinates: isValidCoordinates(originCoordinates)
        ? { ...originCoordinates, address: shuttle.destinationCity, isLive: false, updatedAt: arrivedAt }
        : { lat: null, lng: null, address: '', isLive: false, updatedAt: arrivedAt },
      features: shuttle.features,
      notes: shuttle.notes,
      active: true,
    };
    try {
      returnRoute = await Shuttle.findOneAndUpdate(
        { returnRouteFor: shuttle._id },
        { $setOnInsert: nextRoute },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();
    } catch (error) {
      if (error?.code !== 11000) throw error;
      returnRoute = await Shuttle.findOne({ returnRouteFor: shuttle._id }).lean();
    }
  }

  await Promise.all([
    Shuttle.findByIdAndUpdate(shuttle._id, {
      $set: {
        currentStatus: 'completed',
        arrivedAt,
        returnRouteRef: returnRoute?._id || null,
        ...(isValidCoordinates(arrivalCoordinates) ? {
          currentCoordinates: { ...arrivalCoordinates, isLive: false, updatedAt: arrivedAt },
        } : {}),
      },
    }),
    ShuttleBooking.updateMany({ shuttleRef: shuttle._id, status: 'paid' }, { $set: { status: 'completed' } }),
    ShuttleBooking.updateMany(
      { shuttleRef: shuttle._id, status: { $in: ['pending_approval', 'approved', 'payment_reported'] } },
      { $set: { status: 'cancelled', declineReason: 'This trip has arrived at its destination.' } }
    ),
  ]);

  return returnRoute;
};

// If phone GPS never confirms arrival, close a departed trip after four hours
// and publish its return route at the saved destination pin. The returnRouteFor
// unique index keeps this safe to retry from the background scheduler.
export const sweepOverdueShuttleArrivals = async (now = new Date()) => {
  const fallbackCutoff = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const overdueTrips = await Shuttle.find({
    active: true,
    currentStatus: 'en_route',
    departedAt: { $ne: null, $lte: fallbackCutoff },
  }).select('_id').sort({ departedAt: 1 }).limit(100).lean();

  const results = await Promise.allSettled(
    overdueTrips.map((trip) => finishShuttleTripAndCreateReturn(trip._id, null, now))
  );
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length) {
    console.error(`Could not auto-arrive ${failed.length} overdue shuttle trip(s):`, failed[0].reason?.message || failed[0].reason);
  }
  return results.length - failed.length;
};
