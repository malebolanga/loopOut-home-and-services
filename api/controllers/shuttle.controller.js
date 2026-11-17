import Shuttle from '../models/shuttle.model.js';
import ShuttleBooking from '../models/shuttleBooking.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

const SEEDED_SAMPLE_SCAN_URL = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=compress&cs=tinysrgb&w=600';
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    if (requiredText.some((value) => typeof value !== 'string' || !value.trim()) || pricePerSeat === undefined || !departureDate) {
      return next(errorHandler(400, 'Please provide vehicle type, plate number, route, and seat price.'));
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
    if (user.driverVerification?.status !== 'verified'
      || !user.driverVerification?.idDocumentUrl
      || !user.driverVerification?.facePhotoUrl
      || !user.driverVerification?.licenceDocumentUrl) {
      return next(errorHandler(403, 'Your ID, face photo, and driving licence must be approved before you can add a route.'));
    }

    const vehicle = await Shuttle.findOne({ _id: req.params.id, driverRef: user._id, active: true });
    if (!vehicle) return next(errorHandler(404, 'An active vehicle belonging to your account was not found.'));

    const {
      serviceType, departureProvince, destinationProvince, originCity, destinationCity,
      pickupStation, dropoffStation, dropoffType, isHouseToHouse, departureRule,
      leavesWhenFull, departureDate, departureTime, estimatedArrival, pricePerSeat,
      extraBagPrice, luggageNotes,
    } = req.body;

    if (![originCity, destinationCity].every((value) => typeof value === 'string' && value.trim()) || !departureDate) {
      return next(errorHandler(400, 'Enter the route cities and departure date.'));
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

    const query = { active: true, departureDate: { $gte: new Date() }, driverVerificationStatus: { $ne: 'rejected' }, driverLicenceScan: { $ne: SEEDED_SAMPLE_SCAN_URL } };

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

    const [shuttles, totalCount] = await Promise.all([
      Shuttle.find(query)
        .select('-driverPhone -driverLicenceScan -driverIdScan -driverFaceScan -driverLicenceNumber -bankAccountHolder -bankName -bankAccountNumber -bankBranchCode -bankAccountType -bankReference -reservedSeatNumbers')
        .sort({ departureDate: 1, createdAt: -1 })
        .limit(limit)
        .skip(startIndex)
        .lean(),
      Shuttle.countDocuments(query),
    ]);

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
              : { lat: null, lng: null, address: '', accuracy: null, isLive: false, updatedAt: null },
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
    const shuttle = await Shuttle.findById(req.params.id).lean();
    if (!shuttle || shuttle.driverLicenceScan === SEEDED_SAMPLE_SCAN_URL || shuttle.driverVerificationStatus === 'rejected' || !shuttle.active || new Date(shuttle.departureDate) < new Date()) return next(errorHandler(404, 'Shuttle route not found.'));
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

    if (currentStatus) {
      shuttle.currentStatus = currentStatus;
    }

    const updated = await shuttle.save();

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
      'pickupStation', 'dropoffStation', 'dropoffType', 'isHouseToHouse', 'departureRule',
      'leavesWhenFull', 'departureDate', 'departureTime', 'estimatedArrival', 'pricePerSeat',
      'features', 'notes', 'freeBagsPerPassenger', 'extraBagPrice', 'maxExtraBagsPerPassenger', 'luggageNotes',
    ];
    const safeUpdates = Object.fromEntries(allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const updated = await Shuttle.findByIdAndUpdate(req.params.id, { $set: safeUpdates }, { new: true, runValidators: true });

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
