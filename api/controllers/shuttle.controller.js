import Shuttle from '../models/shuttle.model.js';
import ShuttleBooking from '../models/shuttleBooking.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';
import { advanceShuttleDeparture, distanceBetweenCoordinatesKm, finishShuttleTripAndCreateReturn, getScheduledShuttleDeparture, hasExplicitShuttleSchedule } from '../utils/shuttleTripLifecycle.js';

const SEEDED_SAMPLE_SCAN_URL = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=compress&cs=tinysrgb&w=600';
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validRouteCoordinates = (coords) => coords && coords.lat !== null && coords.lat !== undefined && coords.lat !== '' && coords.lng !== null && coords.lng !== undefined && coords.lng !== ''
  && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lng))
  && Number(coords.lat) >= -90 && Number(coords.lat) <= 90 && Number(coords.lng) >= -180 && Number(coords.lng) <= 180;

// Haversine formula to compute geodesic distance in kilometres
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Create a new Shuttle (Driver registration)
export const createShuttle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+driverVerification');
    if (!user) return next(errorHandler(404, 'User profile not found.'));
    if (user.offeringType !== 'shuttle') return next(errorHandler(403, 'Choose Transport Driver in Become before adding a shuttle.'));
    if (user.driverVerification?.status !== 'verified'
      || !user.driverVerification?.idDocumentUrl
      || !user.driverVerification?.facePhotoUrl
      || !user.driverVerification?.licenceDocumentUrl) {
      return next(errorHandler(403, 'Submit your ID, face photo, and driving licence and wait for administrator approval before adding a shuttle.'));
    }

    const {
      carType,
      plateNumber,
      carColor,
      carImages,
      totalSeats,
      serviceType,
      departureProvince,
      destinationProvince,
      originCity,
      destinationCity,
      originCoordinates,
      destinationCoordinates,
      pickupStation,
      dropoffStation,
      departureDate,
      departureTime,
      driverPhone,
      estimatedArrival,
      pricePerSeat,
      features,
      notes,
      currentCoordinates,
      // House to House & Flexible Schedule fields
      dropoffType,
      isHouseToHouse,
      departureRule,
      leavesWhenFull,
      freeBagsPerPassenger,
      extraBagPrice,
      maxExtraBagsPerPassenger,
      luggageNotes,
      // Driver Banking Details (For direct passenger EFT payments)
      bankAccountHolder,
      bankName,
      bankAccountNumber,
      bankBranchCode,
      bankAccountType,
      bankReference,
    } = req.body;

    const requiredText = [carType, plateNumber, originCity, destinationCity, departureTime];
    if (requiredText.some((value) => typeof value !== 'string' || !value.trim()) || !/\d{1,2}:\d{2}/.test(String(departureTime || '')) || pricePerSeat === undefined || !departureDate) {
      return next(errorHandler(400, 'Please provide the vehicle, route, seat price, and a planned departure date and time.'));
    }
    if (!validRouteCoordinates(originCoordinates) || !validRouteCoordinates(destinationCoordinates)) {
      return next(errorHandler(400, 'Set GPS map pins for both the route start and destination. The destination pin is needed to show the shuttle there if arrival GPS is unavailable.'));
    }

    const seatsNum = Number(totalSeats);
    const priceNum = Number(pricePerSeat);
    const departureAt = new Date(departureDate);
    if (!Number.isInteger(seatsNum) || seatsNum < 1 || seatsNum > 65) return next(errorHandler(400, 'Enter a valid seat capacity from 1 to 65.'));
    if (!Number.isFinite(priceNum) || priceNum <= 0) return next(errorHandler(400, 'Enter a valid fare greater than zero.'));
    if (Number.isNaN(departureAt.getTime())) return next(errorHandler(400, 'Enter a valid departure date.'));

    const newShuttle = new Shuttle({
      driverRef: user._id,
      driverName: user.username || user.name || 'LoopOut driver',
      driverPhone: String(driverPhone || user.phone || '').trim(),
      driverAvatar: user.driverVerification.facePhotoUrl,
      // Keep sensitive verification files in the private User driverVerification record.
      driverLicenceScan: '',
      driverIdScan: '',
      driverFaceScan: '',
      driverLicenceNumber: '',
      driverVerificationStatus: 'verified',
      bankAccountHolder: (bankAccountHolder || user.name || user.username || '').trim(),
      bankName: (bankName || '').trim(),
      bankAccountNumber: (bankAccountNumber || '').trim(),
      bankBranchCode: (bankBranchCode || '').trim(),
      bankAccountType: (bankAccountType || 'Savings').trim(),
      bankReference: (bankReference || '').trim(),
      carType: carType.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      carColor: (carColor || '').trim(),
      carImages: Array.isArray(carImages) ? carImages.filter((url) => typeof url === 'string' && url.trim()).slice(0, 8) : [],
      totalSeats: seatsNum,
      availableSeats: seatsNum,
      serviceType: serviceType === 'local' ? 'local' : 'interprovincial',
      departureProvince: departureProvince || '',
      destinationProvince: destinationProvince || '',
      originCity: originCity.trim(),
      destinationCity: destinationCity.trim(),
      ...(validRouteCoordinates(originCoordinates) ? { originCoordinates: { lat: Number(originCoordinates.lat), lng: Number(originCoordinates.lng) } } : {}),
      ...(validRouteCoordinates(destinationCoordinates) ? { destinationCoordinates: { lat: Number(destinationCoordinates.lat), lng: Number(destinationCoordinates.lng) } } : {}),
      pickupStation: (pickupStation || '').trim(),
      dropoffStation: (dropoffStation || '').trim(),
      dropoffType: dropoffType || 'house_to_house',
      isHouseToHouse: isHouseToHouse !== undefined ? Boolean(isHouseToHouse) : true,
      departureRule: departureRule || 'when_full',
      leavesWhenFull: leavesWhenFull !== undefined ? Boolean(leavesWhenFull) : true,
      departureDate: departureAt,
      departureTime: departureTime.trim(),
      estimatedArrival: estimatedArrival || '',
      pricePerSeat: priceNum,
      freeBagsPerPassenger: freeBagsPerPassenger !== undefined ? Number(freeBagsPerPassenger) : 1,
      extraBagPrice: extraBagPrice !== undefined ? Number(extraBagPrice) : 0,
      maxExtraBagsPerPassenger: maxExtraBagsPerPassenger !== undefined ? Number(maxExtraBagsPerPassenger) : 2,
      luggageNotes: luggageNotes || '1 standard bag free. Extra bags charged additionally.',
      currentStatus: 'scheduled',
      currentCoordinates: currentCoordinates && currentCoordinates.lat !== undefined && currentCoordinates.lng !== undefined ? {
        lat: Number(currentCoordinates.lat),
        lng: Number(currentCoordinates.lng),
        address: currentCoordinates.address || originCity,
        updatedAt: new Date()
      } : { lat: null, lng: null, address: '', isLive: false },
      features: Array.isArray(features) ? features : [],
      notes: notes || '',
      active: true,
    });

    const saved = await newShuttle.save();
    return res.status(201).json({
      success: true,
      message: 'Shuttle route successfully registered!',
      shuttle: saved
    });
  } catch (error) {
    next(error);
  }
};

// Add a new route using an existing, approved vehicle and driver profile.
export const addRouteToShuttle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+driverVerification');
    if (!user) return next(errorHandler(404, 'User profile not found.'));
    if (user.offeringType !== 'shuttle') return next(errorHandler(403, 'Choose Transport Driver in Become before adding a shuttle route.'));
    if (user.driverVerification?.status !== 'verified'
      || !user.driverVerification?.idDocumentUrl
      || !user.driverVerification?.facePhotoUrl
      || !user.driverVerification?.licenceDocumentUrl) {
      return next(errorHandler(403, 'Your ID, face photo, and driving licence must be approved before you can add a route.'));
    }

    const vehicle = await Shuttle.findOne({ _id: req.params.id, driverRef: user._id, active: true });
    if (!vehicle) return next(errorHandler(404, 'An active vehicle belonging to your account was not found.'));

    const {
      serviceType, departureProvince, destinationProvince, originCity, destinationCity, originCoordinates, destinationCoordinates,
      pickupStation, dropoffStation, dropoffType, isHouseToHouse, departureRule,
      leavesWhenFull, departureDate, departureTime, estimatedArrival, pricePerSeat,
      extraBagPrice, luggageNotes,
    } = req.body;

    if (![originCity, destinationCity].every((value) => typeof value === 'string' && value.trim()) || !departureDate || !/\d{1,2}:\d{2}/.test(String(departureTime || ''))) {
      return next(errorHandler(400, 'Enter the route cities and planned departure time.'));
    }
    const departureAt = new Date(departureDate);
    if (Number.isNaN(departureAt.getTime()) || departureAt <= new Date()) {
      return next(errorHandler(400, 'Choose a future departure date.'));
    }
    const priceNum = Number(pricePerSeat);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return next(errorHandler(400, 'Enter a fare greater than zero for this route.'));
    }
    const routeType = serviceType === 'local' ? 'local' : 'interprovincial';
    const originProvince = String(departureProvince || '').trim();
    const targetProvince = routeType === 'local' ? originProvince : String(destinationProvince || '').trim();
    if (!originProvince || !targetProvince) return next(errorHandler(400, 'Choose the origin and destination provinces.'));
    const bagPrice = Number(extraBagPrice ?? vehicle.extraBagPrice ?? 0);
    if (!Number.isFinite(bagPrice) || bagPrice < 0) return next(errorHandler(400, 'Enter a valid extra-bag price.'));

    const houseToHouse = isHouseToHouse !== undefined ? Boolean(isHouseToHouse) : vehicle.isHouseToHouse;
    const leaveWhenFull = leavesWhenFull !== undefined ? Boolean(leavesWhenFull) : vehicle.leavesWhenFull;
    const newRoute = new Shuttle({
      driverRef: user._id,
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      driverAvatar: user.driverVerification.facePhotoUrl,
      // Verification documents remain in the private User record, not copied to each route.
      driverVerificationStatus: 'verified',
      carType: vehicle.carType,
      plateNumber: vehicle.plateNumber,
      carColor: vehicle.carColor,
      carImages: vehicle.carImages,
      totalSeats: vehicle.totalSeats,
      availableSeats: vehicle.totalSeats,
      serviceType: routeType,
      departureProvince: originProvince,
      destinationProvince: targetProvince,
      originCity: originCity.trim(),
      destinationCity: destinationCity.trim(),
      ...(validRouteCoordinates(originCoordinates) ? { originCoordinates: { lat: Number(originCoordinates.lat), lng: Number(originCoordinates.lng) } } : {}),
      ...(validRouteCoordinates(destinationCoordinates) ? { destinationCoordinates: { lat: Number(destinationCoordinates.lat), lng: Number(destinationCoordinates.lng) } } : {}),
      pickupStation: String(pickupStation || originCity).trim(),
      dropoffStation: String(dropoffStation || destinationCity).trim(),
      dropoffType: dropoffType || (houseToHouse ? 'house_to_house' : 'station'),
      isHouseToHouse: houseToHouse,
      departureRule: departureRule || (leaveWhenFull ? 'when_full' : 'scheduled'),
      leavesWhenFull: leaveWhenFull,
      departureDate: departureAt,
      departureTime: String(departureTime || (leaveWhenFull ? 'When full' : '')).trim(),
      estimatedArrival: String(estimatedArrival || '').trim(),
      pricePerSeat: priceNum,
      freeBagsPerPassenger: vehicle.freeBagsPerPassenger,
      extraBagPrice: bagPrice,
      maxExtraBagsPerPassenger: vehicle.maxExtraBagsPerPassenger,
      luggageNotes: String(luggageNotes || vehicle.luggageNotes || '').trim(),
      features: vehicle.features || [],
      notes: vehicle.notes || '',
      bankAccountHolder: vehicle.bankAccountHolder,
      bankName: vehicle.bankName,
      bankAccountNumber: vehicle.bankAccountNumber,
      bankBranchCode: vehicle.bankBranchCode,
      bankAccountType: vehicle.bankAccountType,
      bankReference: vehicle.bankReference,
      currentStatus: 'scheduled',
      currentCoordinates: { lat: null, lng: null, address: '', accuracy: null, isLive: false },
      active: true,
    });

    const saved = await newRoute.save();
    return res.status(201).json({ success: true, message: 'New route added using your existing approved vehicle.', shuttle: saved });
  } catch (error) {
    next(error);
  }
};

// Create a fresh trip from a driver's completed/cancelled route history.
// The saved South African departure time is reused for the next matching date.
export const activateSavedShuttleRoute = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+driverVerification');
    if (!user) return next(errorHandler(404, 'User profile not found.'));
    if (user.accountStatus === 'suspended') return next(errorHandler(403, 'Your account is suspended. Contact support before activating a route.'));
    if (user.offeringType !== 'shuttle') return next(errorHandler(403, 'Choose Transport Driver in Become before activating a shuttle route.'));
    if (user.driverVerification?.status !== 'verified'
      || !user.driverVerification?.idDocumentUrl
      || !user.driverVerification?.facePhotoUrl
      || !user.driverVerification?.licenceDocumentUrl) {
      return next(errorHandler(403, 'Your ID, face photo, and driving licence must be approved before you can activate a route.'));
    }

    const source = await Shuttle.findOne({ _id: req.params.id, driverRef: user._id, active: true }).lean();
    if (!source) return next(errorHandler(404, 'Saved route not found for your account.'));
    if (!['completed', 'arrived', 'cancelled'].includes(source.currentStatus)) {
      return next(errorHandler(409, 'This route is still scheduled or in progress. Activate a completed or cancelled route.'));
    }
    if (!hasExplicitShuttleSchedule(source)) {
      return next(errorHandler(400, 'This saved route has no valid departure time. Edit its departure details before activating it.'));
    }

    const now = new Date();
    const departureTime = String(source.departureTime).trim();
    const match = departureTime.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.?M\.?|P\.?M\.?)?/i);
    if (!match) return next(errorHandler(400, 'This saved route has no valid departure time. Edit its departure details before activating it.'));
    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const meridiem = match[3]?.replace(/\./g, '').toUpperCase();
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    // Use South African calendar dates consistently, independent of server timezone.
    const southAfricaNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    let year = southAfricaNow.getUTCFullYear();
    let month = southAfricaNow.getUTCMonth();
    let day = southAfricaNow.getUTCDate();
    let departureAt = new Date(Date.UTC(year, month, day, hours, minutes) - 2 * 60 * 60 * 1000);
    if (departureAt <= now) {
      const tomorrow = new Date(Date.UTC(year, month, day + 1));
      year = tomorrow.getUTCFullYear();
      month = tomorrow.getUTCMonth();
      day = tomorrow.getUTCDate();
      departureAt = new Date(Date.UTC(year, month, day, hours, minutes) - 2 * 60 * 60 * 1000);
    }

    const freshTrip = new Shuttle({
      driverRef: source.driverRef,
      driverName: source.driverName,
      driverPhone: source.driverPhone,
      driverAvatar: user.driverVerification.facePhotoUrl || source.driverAvatar,
      driverVerificationStatus: 'verified',
      bankAccountHolder: source.bankAccountHolder,
      bankName: source.bankName,
      bankAccountNumber: source.bankAccountNumber,
      bankBranchCode: source.bankBranchCode,
      bankAccountType: source.bankAccountType,
      bankReference: source.bankReference,
      carType: source.carType,
      plateNumber: source.plateNumber,
      carColor: source.carColor,
      carImages: source.carImages || [],
      totalSeats: source.totalSeats,
      availableSeats: source.totalSeats,
      reservedSeatNumbers: [],
      serviceType: source.serviceType,
      departureProvince: source.departureProvince,
      destinationProvince: source.destinationProvince,
      originCity: source.originCity,
      destinationCity: source.destinationCity,
      originCoordinates: source.originCoordinates,
      destinationCoordinates: source.destinationCoordinates,
      pickupStation: source.pickupStation,
      dropoffStation: source.dropoffStation,
      dropoffType: source.dropoffType,
      isHouseToHouse: source.isHouseToHouse,
      departureRule: source.departureRule,
      leavesWhenFull: source.leavesWhenFull,
      departureDate: departureAt,
      departureTime,
      estimatedArrival: source.estimatedArrival,
      pricePerSeat: source.pricePerSeat,
      freeBagsPerPassenger: source.freeBagsPerPassenger,
      extraBagPrice: source.extraBagPrice,
      maxExtraBagsPerPassenger: source.maxExtraBagsPerPassenger,
      luggageNotes: source.luggageNotes,
      currentStatus: 'scheduled',
      currentCoordinates: { lat: null, lng: null, address: '', accuracy: null, isLive: false },
      features: source.features || [],
      notes: source.notes || '',
      active: true,
    });

    const saved = await freshTrip.save();
    return res.status(201).json({ success: true, message: 'Saved route activated for its next departure.', shuttle: saved });
  } catch (error) {
    next(error);
  }
};

// Get Shuttles with search, filter, and pagination
export const getShuttles = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const {
      serviceType,
      departureProvince,
      destinationProvince,
      originCity,
      destinationCity,
      searchTerm,
      status,
      driverRef,
    } = req.query;

    const query = {
      active: true,
      currentStatus: { $in: ['scheduled', 'boarding', 'en_route', 'arrived'] },
      $and: [{ $or: [
        { currentStatus: { $in: ['scheduled', 'boarding'] } },
        { currentStatus: { $in: ['en_route', 'arrived'] } },
      ] }],
      departureDate: { $type: 'date' },
      departureTime: { $regex: /(\d{1,2}:\d{2}|\d{1,2}\s*(AM|PM|A\.?M\.?|P\.?M\.?))/i },
      driverVerificationStatus: { $ne: 'rejected' },
      driverLicenceScan: { $ne: SEEDED_SAMPLE_SCAN_URL },
    };

    if (driverRef) {
      query.driverRef = driverRef;
    }

    if (serviceType && serviceType !== 'all') {
      query.serviceType = serviceType;
    }

    if (status && status !== 'all') {
      query.currentStatus = status;
    }

    if (departureProvince && departureProvince !== 'all') {
      query.departureProvince = { $regex: escapeRegex(departureProvince), $options: 'i' };
    }

    if (destinationProvince && destinationProvince !== 'all') {
      query.destinationProvince = { $regex: escapeRegex(destinationProvince), $options: 'i' };
    }

    if (originCity && originCity !== 'all') {
      query.originCity = { $regex: escapeRegex(originCity), $options: 'i' };
    }

    if (destinationCity && destinationCity !== 'all') {
      query.destinationCity = { $regex: escapeRegex(destinationCity), $options: 'i' };
    }

    if (searchTerm) {
      query.$or = [
        { carType: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { originCity: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { destinationCity: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { pickupStation: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { dropoffStation: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { plateNumber: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { driverName: { $regex: escapeRegex(searchTerm), $options: 'i' } },
      ];
    }

    const [candidateShuttles, totalCount] = await Promise.all([
      Shuttle.find(query)
        .select('-driverPhone -driverLicenceScan -driverIdScan -driverFaceScan -driverLicenceNumber -bankAccountHolder -bankName -bankAccountNumber -bankBranchCode -bankAccountType -bankReference -reservedSeatNumbers')
        .sort({ departureDate: 1, createdAt: -1 })
        .limit(limit)
        .skip(startIndex)
        .lean(),
      Shuttle.countDocuments(query),
    ]);

    const shuttles = (await Promise.all(candidateShuttles.map((shuttle) => advanceShuttleDeparture(shuttle))))
      .filter((shuttle) => shuttle && hasExplicitShuttleSchedule(shuttle)
        && (['en_route', 'arrived'].includes(shuttle.currentStatus)
          || (['scheduled', 'boarding'].includes(shuttle.currentStatus) && getScheduledShuttleDeparture(shuttle) > new Date())));

    // ── Enrich each shuttle with live stats from real bookings ───
    // This ensures rating and completedTrips are always accurate
    // even if the driver hasn't received a rating yet.
    const enrichedShuttles = await Promise.all(
      shuttles.map(async (shuttle) => {
        try {
          // Completed trip count for this driver
          const completedCount = await ShuttleBooking.countDocuments({
            driverRef: shuttle.driverRef,
            status: 'completed',
          });

          // Average rating across all rated bookings for this shuttle
          const ratedBookings = await ShuttleBooking.find({
            shuttleRef: shuttle._id,
            passengerRating: { $ne: null, $exists: true },
          }).select('passengerRating').lean();

          const ratingCount = ratedBookings.length;
          const avgRating = ratingCount > 0
            ? Math.round(
                (ratedBookings.reduce((sum, b) => sum + (b.passengerRating || 0), 0) / ratingCount) * 10
              ) / 10
            : shuttle.driverRating || 0;

          return {
            ...shuttle,
            currentCoordinates: shuttle.currentCoordinates?.isLive === true
              ? shuttle.currentCoordinates
              : (shuttle.returnRouteFor && validRouteCoordinates(shuttle.currentCoordinates)
                ? shuttle.currentCoordinates
                : { lat: null, lng: null, address: '', accuracy: null, isLive: false, updatedAt: null }),
            // This app has no shuttle-document review workflow. Never expose an
            // unreviewed document upload as a verified identity claim.
            driverVerificationStatus: shuttle.driverVerificationStatus === 'verified' ? 'verified' : 'pending',
            completedTrips: completedCount,
            driverRating: avgRating,
            driverRatingCount: ratingCount,
          };
        } catch (e) {
          return shuttle; // fail gracefully — return original
        }
      })
    );

    return res.status(200).json({
      success: true,
      totalCount,
      count: enrichedShuttles.length,
      shuttles: enrichedShuttles,
    });
  } catch (error) {
    next(error);
  }
};

// Get single shuttle by ID (includes taken seats)
export const getShuttleById = async (req, res, next) => {
  try {
    let shuttle = await Shuttle.findById(req.params.id).lean();
    shuttle = await advanceShuttleDeparture(shuttle);
    const scheduledDeparture = getScheduledShuttleDeparture(shuttle);
    const isVisibleInProgressTrip = ['en_route', 'arrived'].includes(shuttle?.currentStatus);
    if (!shuttle || !hasExplicitShuttleSchedule(shuttle) || shuttle.driverLicenceScan === SEEDED_SAMPLE_SCAN_URL || shuttle.driverVerificationStatus === 'rejected' || !shuttle.active
      || (!['scheduled', 'boarding'].includes(shuttle.currentStatus) && !isVisibleInProgressTrip)
      || (['scheduled', 'boarding'].includes(shuttle.currentStatus) && scheduledDeparture <= new Date())) return next(errorHandler(404, 'Shuttle route not found.'));
    const requesterId = String(req.user?.id || '');
    if (!shuttle.active && requesterId !== String(shuttle.driverRef) && !req.user?.isAdmin) {
      return next(errorHandler(404, 'Shuttle route not found.'));
    }

    // Fetch active bookings to calculate reserved seat numbers
    const activeBookings = await ShuttleBooking.find({
      shuttleRef: shuttle._id,
      status: { $in: ['pending_approval', 'approved', 'paid'] }
    }).select('seatNumbers seatsBooked status passengerName').lean();

    const bookedSeatNumbers = [];
    activeBookings.forEach((b) => {
      if (Array.isArray(b.seatNumbers)) {
        bookedSeatNumbers.push(...b.seatNumbers);
      }
    });

    // Calculate real stats for this shuttle and driver
    const [completedTrips, ratedBookings] = await Promise.all([
      ShuttleBooking.countDocuments({
        driverRef: shuttle.driverRef,
        status: 'completed',
      }),
      ShuttleBooking.find({
        shuttleRef: shuttle._id,
        passengerRating: { $ne: null, $exists: true },
      }).select('passengerRating').lean(),
    ]);

    const ratingCount = ratedBookings.length;
    const avgRating = ratingCount > 0
      ? Math.round(
          (ratedBookings.reduce((sum, b) => sum + (b.passengerRating || 0), 0) / ratingCount) * 10
        ) / 10
      : shuttle.driverRating || 0;

    return res.status(200).json({
      success: true,
      shuttle: {
        ...Object.fromEntries(Object.entries(shuttle).filter(([key]) => ![
          'driverPhone', 'driverLicenceScan', 'driverIdScan', 'driverFaceScan', 'driverLicenceNumber',
          'bankAccountHolder', 'bankName', 'bankAccountNumber', 'bankBranchCode', 'bankAccountType', 'bankReference', 'reservedSeatNumbers',
        ].includes(key))),
        currentCoordinates: shuttle.currentCoordinates?.isLive === true
          ? shuttle.currentCoordinates
          : { lat: null, lng: null, address: '', accuracy: null, isLive: false, updatedAt: null },
        driverVerificationStatus: shuttle.driverVerificationStatus === 'verified' ? 'verified' : 'pending',
        bookedSeatNumbers,
        activeBookingsCount: activeBookings.length,
        completedTrips,
        driverRating: avgRating,
        driverRatingCount: ratingCount,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update shuttle live location and status (e.g. driver driving with phone GPRS)
export const updateShuttleLocation = async (req, res, next) => {
  try {
    const { lat, lng, address, currentStatus, accuracy, isLive } = req.body;
    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) return next(errorHandler(404, 'Shuttle not found.'));

    // Only the shuttle owner or an administrator can update its live location.
    const isOwner = shuttle.driverRef && String(shuttle.driverRef) === String(req.user.id);
    const isAdmin = !!req.user.isAdmin;
    if (!isOwner && !isAdmin) return next(errorHandler(403, 'You are not authorized to update this shuttle location.'));

    if (lat !== undefined || lng !== undefined) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return next(errorHandler(400, 'Provide valid GPS coordinates.'));
      }
    }
    if (currentStatus && !['scheduled', 'boarding', 'en_route', 'arrived', 'completed', 'cancelled'].includes(currentStatus)) {
      return next(errorHandler(400, 'Invalid shuttle status.'));
    }

    const previousStatus = shuttle.currentStatus;
    const previousLiveCoords = validRouteCoordinates(shuttle.currentCoordinates) && shuttle.currentCoordinates.isLive === true
      ? shuttle.currentCoordinates
      : null;

    let gpsPosition = null;
    if (isLive !== false && lat !== undefined && lng !== undefined) {
      gpsPosition = { lat: Number(lat), lng: Number(lng) };
    }

    if (isLive === false) {
      shuttle.currentCoordinates = { lat: null, lng: null, address: '', accuracy: null, isLive: false, updatedAt: new Date() };
    } else if (lat !== undefined && lng !== undefined) {
      shuttle.currentCoordinates = {
        lat: Number(lat),
        lng: Number(lng),
        address: address || shuttle.currentCoordinates?.address || '',
        accuracy: accuracy !== undefined ? Number(accuracy) : shuttle.currentCoordinates?.accuracy,
        isLive: isLive !== undefined ? Boolean(isLive) : true,
        updatedAt: new Date()
      };
    }

    if (currentStatus === 'arrived') return next(errorHandler(400, 'Use the Finish trip button after the trip is complete.'));
    const statusOrder = { scheduled: 0, boarding: 0, en_route: 1, arrived: 2, completed: 3, cancelled: 3 };
    const incomingStatusIsOlder = currentStatus
      && (statusOrder[currentStatus] ?? 0) < (statusOrder[shuttle.currentStatus] ?? 0);
    const effectiveStatus = incomingStatusIsOlder ? shuttle.currentStatus : (currentStatus || shuttle.currentStatus);
    if (currentStatus && !incomingStatusIsOlder) shuttle.currentStatus = currentStatus;

    if (effectiveStatus === 'en_route' && gpsPosition && !validRouteCoordinates(shuttle.originCoordinates)) {
      shuttle.originCoordinates = gpsPosition;
    }
    if (effectiveStatus === 'en_route' && !shuttle.departedAt) shuttle.departedAt = new Date();

    let updated = await shuttle.save();
    if (effectiveStatus === 'completed' && previousStatus !== 'completed') {
      const arrivalCoordinates = gpsPosition || previousLiveCoords || shuttle.destinationCoordinates;
      await finishShuttleTripAndCreateReturn(shuttle._id, arrivalCoordinates, new Date());
      updated = await Shuttle.findById(shuttle._id);
      const notificationLock = await Shuttle.findOneAndUpdate(
        { _id: shuttle._id, tripCompletionNotifiedAt: null },
        { $set: { tripCompletionNotifiedAt: new Date() } },
        { new: true, projection: { _id: 1 } }
      );
      if (notificationLock) {
        const completedBookings = await ShuttleBooking.find({ shuttleRef: shuttle._id, status: 'completed' }).select('passengerRef ticketCode');
        await Promise.all(completedBookings.map((booking) => Notification.create({
          userId: booking.passengerRef,
          type: 'shuttle',
          title: 'Your shuttle has arrived',
          message: `Your trip to ${shuttle.destinationCity} is complete. Thank you for travelling with LoopOut.`,
          data: { shuttleId: shuttle._id, bookingId: booking._id, ticketCode: booking.ticketCode, route: `/shuttles?shuttleId=${shuttle._id}` },
        })));
      }
    }

    // ── 2km Proximity Trip Alert Trigger ─────────────────────────────
    // When driver is moving (with GPRS) and enters within 2km of a passenger's pickup location
    if (lat !== undefined && lng !== undefined && isLive !== false) {
      try {
        const activeBookings = await ShuttleBooking.find({
          shuttleRef: shuttle._id,
          status: { $in: ['approved', 'paid'] },
          proximityAlertSent: { $ne: true },
        });

        for (const booking of activeBookings) {
          let pickLat = booking.pickupCoordinates?.lat;
          let pickLng = booking.pickupCoordinates?.lng;

          // If coordinates are available, check distance
          if (pickLat && pickLng) {
            const distKm = calculateDistanceKm(Number(lat), Number(lng), pickLat, pickLng);
            if (distKm !== null && distKm <= 2.0) {
              booking.proximityAlertSent = true;
              await booking.save();

              await Notification.create({
                userId: booking.passengerRef,
                type: 'shuttle',
                title: '🚨 Shuttle Within 2 km!',
                message: `Your shuttle (${shuttle.plateNumber} • ${shuttle.carType}) is ~${distKm.toFixed(1)} km away from your pickup at "${booking.pickupLocation || shuttle.originCity}". Please get ready to board!`,
                data: {
                  shuttleId: shuttle._id,
                  bookingId: booking._id,
                  ticketCode: booking.ticketCode,
                  plateNumber: shuttle.plateNumber,
                  carType: shuttle.carType,
                  carColor: shuttle.carColor,
                  driverName: shuttle.driverName,
                  driverPhone: shuttle.driverPhone,
                  originCity: shuttle.originCity,
                  destinationCity: shuttle.destinationCity,
                  pickupLocation: booking.pickupLocation || shuttle.pickupStation,
                  dropoffLocation: booking.dropoffLocation || shuttle.dropoffStation,
                  seatsBooked: booking.seatsBooked,
                  totalPrice: booking.totalPrice,
                  distanceKm: Number(distKm.toFixed(1)),
                  estimatedMinutes: Math.max(1, Math.ceil(distKm * 2)),
                  currentLat: Number(lat),
                  currentLng: Number(lng),
                  route: `/shuttles?shuttleId=${shuttle._id}`,
                }
              });
            }
          }
        }
      } catch (alertErr) {
        console.warn('Proximity alert notification check error:', alertErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Driver live GPRS location updated successfully.',
      shuttle: updated
    });
  } catch (error) {
    next(error);
  }
};

// Update shuttle general details
export const updateShuttle = async (req, res, next) => {
  try {
    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) return next(errorHandler(404, 'Shuttle not found.'));

    if (String(shuttle.driverRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Unauthorized to edit this shuttle.'));
    }

    const allowedFields = [
      'carType', 'plateNumber', 'carColor', 'carImages', 'totalSeats', 'serviceType',
      'departureProvince', 'destinationProvince', 'originCity', 'destinationCity',
      'originCoordinates', 'destinationCoordinates',
      'pickupStation', 'dropoffStation', 'dropoffType', 'isHouseToHouse', 'departureRule',
      'leavesWhenFull', 'departureDate', 'departureTime', 'estimatedArrival', 'pricePerSeat',
      'features', 'notes', 'freeBagsPerPassenger', 'extraBagPrice', 'maxExtraBagsPerPassenger', 'luggageNotes', 'currentStatus',
    ];
    const safeUpdates = Object.fromEntries(allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    for (const field of ['originCoordinates', 'destinationCoordinates']) {
      if (safeUpdates[field] && !validRouteCoordinates(safeUpdates[field])) {
        return next(errorHandler(400, `Provide valid ${field === 'originCoordinates' ? 'origin' : 'destination'} GPS coordinates.`));
      }
    }
    if (safeUpdates.currentStatus && !['scheduled', 'boarding', 'en_route', 'arrived', 'completed', 'cancelled'].includes(safeUpdates.currentStatus)) {
      return next(errorHandler(400, 'Invalid shuttle trip status.'));
    }
    const statusOrder = { scheduled: 0, boarding: 0, en_route: 1, arrived: 2, completed: 3, cancelled: 3 };
    if (safeUpdates.currentStatus && (statusOrder[safeUpdates.currentStatus] ?? 0) < (statusOrder[shuttle.currentStatus] ?? 0)) {
      delete safeUpdates.currentStatus;
    }
    const safeDateKey = (value) => {
      const parsed = new Date(value);
      return Number.isFinite(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : '';
    };
    const requestedDateChanged = req.body.departureDate !== undefined
      && safeDateKey(req.body.departureDate) !== safeDateKey(shuttle.departureDate);
    const requestedTimeChanged = req.body.departureTime !== undefined
      && String(req.body.departureTime || '').trim() !== String(shuttle.departureTime || '').trim();
    if (shuttle.currentStatus === 'completed' && (requestedDateChanged || requestedTimeChanged) && safeUpdates.currentStatus !== 'completed') {
      safeUpdates.currentStatus = 'scheduled';
    }
    const completingTrip = safeUpdates.currentStatus === 'completed' && shuttle.currentStatus !== 'completed';
    if (safeUpdates.currentStatus === 'en_route' && !shuttle.departedAt) safeUpdates.departedAt = new Date();
    let updated = await Shuttle.findByIdAndUpdate(req.params.id, { $set: safeUpdates }, { new: true, runValidators: true });
    if (completingTrip) {
      const arrivalCoordinates = validRouteCoordinates(updated?.currentCoordinates) && updated.currentCoordinates.isLive === true
        ? updated.currentCoordinates
        : shuttle.destinationCoordinates;
      await finishShuttleTripAndCreateReturn(shuttle._id, arrivalCoordinates, new Date());
      updated = await Shuttle.findById(shuttle._id);
    }

    const dateKey = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';
    const departureDateChanged = req.body.departureDate !== undefined
      && dateKey(shuttle.departureDate) !== dateKey(updated.departureDate);
    const departureTimeChanged = req.body.departureTime !== undefined
      && String(shuttle.departureTime || '').trim() !== String(updated.departureTime || '').trim();

    if (departureDateChanged || departureTimeChanged) {
      try {
        const activeBookings = await ShuttleBooking.find({
          shuttleRef: shuttle._id,
          status: { $in: ['pending_approval', 'approved', 'paid'] },
        }).select('_id passengerRef');
        const formatDate = (value) => value
          ? new Date(value).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
          : 'To be confirmed';
        const previousSchedule = `${formatDate(shuttle.departureDate)} at ${shuttle.departureTime || 'time to be confirmed'}`;
        const updatedSchedule = `${formatDate(updated.departureDate)} at ${updated.departureTime || 'time to be confirmed'}`;
        if (activeBookings.length) {
          await Notification.insertMany(activeBookings.map((booking) => ({
            userId: booking.passengerRef,
            type: 'shuttle',
            title: 'Shuttle departure schedule changed',
            message: `The driver changed the departure for ${updated.originCity} → ${updated.destinationCity}. It was ${previousSchedule}; it is now ${updatedSchedule}. Please review your pickup plan.`,
            data: {
              bookingId: booking._id,
              shuttleId: updated._id,
              originCity: updated.originCity,
              destinationCity: updated.destinationCity,
              previousDepartureDate: shuttle.departureDate,
              previousDepartureTime: shuttle.departureTime,
              departureDate: updated.departureDate,
              departureTime: updated.departureTime,
              route: '/shuttles?tab=my-tickets',
            },
          })));
        }
      } catch (notificationError) {
        console.warn('Could not notify shuttle passengers about the schedule change:', notificationError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Shuttle updated successfully.',
      shuttle: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete / deactivate shuttle
export const deleteShuttle = async (req, res, next) => {
  try {
    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) return next(errorHandler(404, 'Shuttle not found.'));

    if (String(shuttle.driverRef) !== String(req.user.id) && !req.user.isAdmin) {
      return next(errorHandler(403, 'Unauthorized to delete this shuttle.'));
    }

    await Shuttle.findByIdAndUpdate(req.params.id, { $set: { active: false } });

    return res.status(200).json({
      success: true,
      message: 'Shuttle successfully deleted.'
    });
  } catch (error) {
    next(error);
  }
};

// Get Shuttles registered by current driver
export const getMyDriverShuttles = async (req, res, next) => {
  try {
    const shuttles = await Shuttle.find({ driverRef: req.user.id, active: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      shuttles
    });
  } catch (error) {
    next(error);
  }
};
