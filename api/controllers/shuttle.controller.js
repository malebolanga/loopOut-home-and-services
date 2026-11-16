import Shuttle from '../models/shuttle.model.js';
import ShuttleBooking from '../models/shuttleBooking.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

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

// Pre-seeded high quality South African routes if the database is initially empty
const defaultSouthAfricanShuttles = [
  {
    carType: 'Toyota Quantum GL 15-Seater',
    plateNumber: 'DZ 88 YK GP',
    carColor: 'Pearl White',
    carImages: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=compress&cs=tinysrgb&w=800',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=compress&cs=tinysrgb&w=800'
    ],
    totalSeats: 15,
    availableSeats: 6,
    serviceType: 'interprovincial',
    departureProvince: 'Gauteng',
    destinationProvince: 'Limpopo',
    originCity: 'Johannesburg',
    destinationCity: 'Polokwane',
    pickupStation: 'Park Station Terminal, JHB',
    dropoffStation: '🏠 House-to-House Dropoff (Direct to your door/gate in Polokwane)',
    dropoffType: 'house_to_house',
    isHouseToHouse: true,
    departureRule: 'when_full',
    leavesWhenFull: true,
    departureDate: new Date(Date.now() + 3600000 * 18),
    departureTime: 'Leaves when full (or 07:30 AM)',
    estimatedArrival: '11:45 AM',
    pricePerSeat: 260,
    freeBagsPerPassenger: 1,
    extraBagPrice: 60,
    maxExtraBagsPerPassenger: 2,
    luggageNotes: '1 normal bag FREE. Extra bags R60 each — trailer space available.',
    currentStatus: 'scheduled',
    currentCoordinates: {
      lat: -26.1952,
      lng: 28.0416,
      address: 'Park Station, Rissik St, Johannesburg',
      updatedAt: new Date()
    },
    features: ['Air Conditioning', 'Trailer Luggage Space', 'USB Charging Ports', 'N1 Tolls Included'],
    notes: 'Direct express trip via N1 North. Quick 15-min comfort stop at Kranskop 1-Stop.',
    active: true
  },
  {
    carType: 'Mercedes-Benz Sprinter 22-Seater VIP',
    plateNumber: 'KZ 44 MT ZN',
    carColor: 'Silver Metallic',
    carImages: [
      'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=compress&cs=tinysrgb&w=800'
    ],
    totalSeats: 22,
    availableSeats: 9,
    serviceType: 'interprovincial',
    departureProvince: 'Gauteng',
    destinationProvince: 'KwaZulu-Natal',
    originCity: 'Pretoria / JHB',
    destinationCity: 'Durban',
    pickupStation: 'Pretoria Bosman & Sandton Gautrain',
    dropoffStation: '🏠 House-to-House Dropoff (Durban Metro & Surrounds)',
    dropoffType: 'house_to_house',
    isHouseToHouse: true,
    departureRule: 'when_full',
    leavesWhenFull: true,
    departureDate: new Date(Date.now() + 3600000 * 24),
    departureTime: 'Leaves when full (or 06:00 AM)',
    estimatedArrival: '12:30 PM',
    pricePerSeat: 380,
    freeBagsPerPassenger: 1,
    extraBagPrice: 80,
    maxExtraBagsPerPassenger: 3,
    luggageNotes: '1 normal bag FREE. Extra luggage R80 each. Spacious VIP trailer.',
    currentStatus: 'scheduled',
    currentCoordinates: {
      lat: -25.7512,
      lng: 28.1884,
      address: 'Pretoria Central, Bosman Station',
      updatedAt: new Date()
    },
    features: ['High-Back Reclining Seats', 'Air Conditioning', 'Free Onboard WiFi', 'Fast Lane Tolls'],
    notes: 'Comfortable VIP long distance. Scenic N3 route via Montrose.',
    active: true
  },
  {
    carType: 'Toyota Rumion 7-Seater',
    plateNumber: 'HP 19 BG L',
    carColor: 'Deep Charcoal Grey',
    carImages: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=compress&cs=tinysrgb&w=800'
    ],
    totalSeats: 6,
    availableSeats: 3,
    serviceType: 'local',
    departureProvince: 'Limpopo',
    destinationProvince: 'Limpopo',
    originCity: 'Polokwane',
    destinationCity: 'Mankweng / Turfloop',
    pickupStation: 'Savannah Mall & Indian Centre Rank',
    dropoffStation: '🏠 Door-to-Campus / House-to-House Dropoff',
    dropoffType: 'house_to_house',
    isHouseToHouse: true,
    departureRule: 'when_full',
    leavesWhenFull: true,
    departureDate: new Date(Date.now() + 3600000 * 2),
    departureTime: 'Leaves when full (Every 20-30 mins)',
    estimatedArrival: '35 mins trip',
    pricePerSeat: 45,
    freeBagsPerPassenger: 1,
    extraBagPrice: 20,
    maxExtraBagsPerPassenger: 1,
    luggageNotes: '1 backpack / normal bag FREE. Extra grocery/luggage bag R20.',
    currentStatus: 'boarding',
    currentCoordinates: {
      lat: -23.8992,
      lng: 29.4795,
      address: 'Savannah Mall, Thabo Mbeki Dr, Polokwane',
      updatedAt: new Date()
    },
    features: ['Door-to-Campus Dropoff', 'Air Conditioning', 'Quick Dispatch'],
    notes: 'Daily local express between Polokwane City and Mankweng.',
    active: true
  },
  {
    carType: 'Toyota Quantum Sesfikile 15-Seater',
    plateNumber: 'WP 62 TR MP',
    carColor: 'Clean White',
    carImages: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=compress&cs=tinysrgb&w=800'
    ],
    totalSeats: 15,
    availableSeats: 4,
    serviceType: 'interprovincial',
    departureProvince: 'Gauteng',
    destinationProvince: 'Mpumalanga',
    originCity: 'Johannesburg',
    destinationCity: 'Mbombela (Nelspruit)',
    pickupStation: 'Bruma Lake & Park Station',
    dropoffStation: '🏠 House-to-House Dropoff (Nelspruit & White River)',
    dropoffType: 'house_to_house',
    isHouseToHouse: true,
    departureRule: 'when_full',
    leavesWhenFull: true,
    departureDate: new Date(Date.now() + 3600000 * 14),
    departureTime: 'Leaves when full (or 08:00 AM)',
    estimatedArrival: '12:00 PM',
    pricePerSeat: 290,
    freeBagsPerPassenger: 1,
    extraBagPrice: 50,
    maxExtraBagsPerPassenger: 2,
    luggageNotes: '1 normal bag FREE. Extra luggage bags R50 each.',
    currentStatus: 'scheduled',
    currentCoordinates: {
      lat: -26.1772,
      lng: 28.1065,
      address: 'Bruma Lake Terminal, Johannesburg',
      updatedAt: new Date()
    },
    features: ['Spacious Boot Luggage', 'Bluetooth Audio', 'Air Conditioning'],
    notes: 'N4 toll road corridor with quick stop at Milly’s Machadodorp.',
    active: true
  }
];

// Helper to seed if no shuttles exist
const seedDefaultShuttlesIfEmpty = async (defaultDriverId) => {
  try {
    const count = await Shuttle.countDocuments();
    if (count === 0) {
      let driver = await User.findById(defaultDriverId);
      if (!driver) {
        driver = await User.findOne();
      }
      if (driver) {
        const seeded = defaultSouthAfricanShuttles.map((s, idx) => ({
          ...s,
          driverRef: driver._id,
          driverName: idx % 2 === 0 ? 'Sipho Ndlovu' : 'Thabo Mokoena',
          driverPhone: driver.phone || '+27 82 555 0192',
          driverAvatar: driver.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=300',
          driverLicenceScan: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=compress&cs=tinysrgb&w=600',
          driverIdScan: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=compress&cs=tinysrgb&w=600',
          driverVerificationStatus: 'verified'
        }));
        await Shuttle.insertMany(seeded);
      }
    }
  } catch (err) {
    console.error('Error auto-seeding default shuttles:', err);
  }
};

// Create a new Shuttle (Driver registration)
export const createShuttle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, 'User profile not found.'));

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
      // Driver Verification Documents (Licence & ID scan)
      driverLicenceScan,
      driverIdScan,
      driverFaceScan,
      driverLicenceNumber,
      // Driver Banking Details (For direct passenger EFT payments)
      bankAccountHolder,
      bankName,
      bankAccountNumber,
      bankBranchCode,
      bankAccountType,
      bankReference,
    } = req.body;

    if (!carType || !plateNumber || !originCity || !destinationCity || !pricePerSeat) {
      return next(errorHandler(400, 'Please provide vehicle type, plate number, route, and seat price.'));
    }

    const seatsNum = Number(totalSeats) || 15;
    const priceNum = Number(pricePerSeat) || 150;

    const newShuttle = new Shuttle({
      driverRef: user._id,
      driverName: user.username || user.name || 'Verified Driver',
      driverPhone: user.phone || req.body.driverPhone || '',
      driverAvatar: user.avatar || '',
      driverLicenceScan: driverLicenceScan || '',
      driverIdScan: driverIdScan || user.idDocumentUrl || '',
      driverFaceScan: driverFaceScan || user.liveSelfieUrl || user.avatar || '',
      driverLicenceNumber: driverLicenceNumber || '',
      driverVerificationStatus: driverLicenceScan && (driverIdScan || user.idDocumentUrl) ? 'verified' : 'pending',
      bankAccountHolder: (bankAccountHolder || user.name || user.username || '').trim(),
      bankName: (bankName || '').trim(),
      bankAccountNumber: (bankAccountNumber || '').trim(),
      bankBranchCode: (bankBranchCode || '').trim(),
      bankAccountType: (bankAccountType || 'Savings').trim(),
      bankReference: (bankReference || '').trim(),
      carType: carType.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      carColor: (carColor || 'White').trim(),
      carImages: Array.isArray(carImages) && carImages.length > 0 ? carImages : ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=compress&cs=tinysrgb&w=800'],
      totalSeats: seatsNum,
      availableSeats: seatsNum,
      serviceType: serviceType === 'local' ? 'local' : 'interprovincial',
      departureProvince: departureProvince || 'Gauteng',
      destinationProvince: destinationProvince || 'Limpopo',
      originCity: originCity.trim(),
      destinationCity: destinationCity.trim(),
      pickupStation: (pickupStation || 'Main Station').trim(),
      dropoffStation: (dropoffStation || 'House-to-House Dropoff (Direct to door / gate)').trim(),
      dropoffType: dropoffType || 'house_to_house',
      isHouseToHouse: isHouseToHouse !== undefined ? Boolean(isHouseToHouse) : true,
      departureRule: departureRule || 'when_full',
      leavesWhenFull: leavesWhenFull !== undefined ? Boolean(leavesWhenFull) : true,
      departureDate: departureDate ? new Date(departureDate) : new Date(Date.now() + 86400000),
      departureTime: departureTime || (leavesWhenFull ? 'Leaves when full / almost full' : '08:00 AM'),
      estimatedArrival: estimatedArrival || '',
      pricePerSeat: priceNum,
      freeBagsPerPassenger: freeBagsPerPassenger !== undefined ? Number(freeBagsPerPassenger) : 1,
      extraBagPrice: extraBagPrice !== undefined ? Number(extraBagPrice) : 0,
      maxExtraBagsPerPassenger: maxExtraBagsPerPassenger !== undefined ? Number(maxExtraBagsPerPassenger) : 2,
      luggageNotes: luggageNotes || '1 standard bag free. Extra bags charged additionally.',
      currentStatus: 'scheduled',
      currentCoordinates: currentCoordinates && currentCoordinates.lat ? {
        lat: Number(currentCoordinates.lat),
        lng: Number(currentCoordinates.lng),
        address: currentCoordinates.address || originCity,
        updatedAt: new Date()
      } : {
        lat: -26.2041,
        lng: 28.0473,
        address: originCity,
        updatedAt: new Date()
      },
      features: Array.isArray(features) && features.length > 0 ? features : ['Air Conditioning', 'Luggage Space', 'USB Charging'],
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

// Get Shuttles with search, filter, and pagination
export const getShuttles = async (req, res, next) => {
  try {
    // If table is completely empty, auto-seed defaults so user gets immediate visual feedback
    await seedDefaultShuttlesIfEmpty(req.user?.id);

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

    const query = { active: true };

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
      query.departureProvince = { $regex: departureProvince, $options: 'i' };
    }

    if (destinationProvince && destinationProvince !== 'all') {
      query.destinationProvince = { $regex: destinationProvince, $options: 'i' };
    }

    if (originCity && originCity !== 'all') {
      query.originCity = { $regex: originCity, $options: 'i' };
    }

    if (destinationCity && destinationCity !== 'all') {
      query.destinationCity = { $regex: destinationCity, $options: 'i' };
    }

    if (searchTerm) {
      query.$or = [
        { carType: { $regex: searchTerm, $options: 'i' } },
        { originCity: { $regex: searchTerm, $options: 'i' } },
        { destinationCity: { $regex: searchTerm, $options: 'i' } },
        { pickupStation: { $regex: searchTerm, $options: 'i' } },
        { dropoffStation: { $regex: searchTerm, $options: 'i' } },
        { plateNumber: { $regex: searchTerm, $options: 'i' } },
        { driverName: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [shuttles, totalCount] = await Promise.all([
      Shuttle.find(query)
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
            status: { $in: ['paid', 'completed'] },
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
    if (!shuttle) return next(errorHandler(404, 'Shuttle route not found.'));

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
        status: { $in: ['paid', 'completed'] },
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
        ...shuttle,
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

    // If driverRef matches or is admin, or if unassigned seed, allow update
    const isOwner = shuttle.driverRef && String(shuttle.driverRef) === String(req.user.id);
    const isAdmin = !!req.user.isAdmin;
    if (!isOwner && !isAdmin) {
      if (!shuttle.driverRef) {
        shuttle.driverRef = req.user.id;
      } else {
        return next(errorHandler(403, 'You are not authorized to update this shuttle location.'));
      }
    }

    if (lat !== undefined && lng !== undefined) {
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
    if (lat !== undefined && lng !== undefined) {
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

    const updated = await Shuttle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

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
