import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import Shuttle from '../models/shuttle.model.js';
import MovingVehicle from '../models/movingVehicle.model.js';
import MovingRequest from '../models/movingRequest.model.js';
import { errorHandler } from '../utils/error.js';
import { notifyLoopOutAdmins } from '../utils/notifyLoopOutAdmins.js';

const distanceKm = (a, b) => {
  const radians = (degrees) => degrees * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const validPoint = (point) => point
  && point.lat !== null && point.lat !== undefined && point.lat !== ''
  && point.lng !== null && point.lng !== undefined && point.lng !== ''
  && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng))
  && Number(point.lat) >= -90 && Number(point.lat) <= 90 && Number(point.lng) >= -180 && Number(point.lng) <= 180;

const validMovingLocation = (point) => {
  if (!validPoint(point)) return false;
  if (point.locationSource === 'address') return true;
  if (point.accuracy === null || point.accuracy === undefined || point.accuracy === '') return true;
  const accuracy = Number(point.accuracy);
  return Number.isFinite(accuracy) && accuracy >= 0;
};

const movingLocationError = 'Please select a valid location on the map, provide an address, or use your phone GPS.';

const isVehicleDocumentUrl = (value, req) => {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const url = new URL(value, base);
    const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    const appHost = url.host === new URL(base).host;
    const firebaseHost = url.hostname === 'firebasestorage.googleapis.com' || url.hostname.endsWith('.firebasestorage.googleapis.com');
    const hasPdfPath = /\.pdf$/i.test(decodeURIComponent(url.pathname));
    return (url.protocol === 'https:' || (url.protocol === 'http:' && localHost)) && (appHost || firebaseHost || localHost) && hasPdfPath;
  } catch { return false; }
};

const isVehiclePhotoUrl = (value, req) => {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const url = new URL(value, base);
    const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    const appHost = url.host === new URL(base).host;
    const firebaseHost = url.hostname === 'firebasestorage.googleapis.com' || url.hostname.endsWith('.firebasestorage.googleapis.com');
    return (url.protocol === 'https:' || (url.protocol === 'http:' && localHost)) && (appHost || firebaseHost || localHost);
  } catch { return false; }
};

export const getNearbyMovingVehicles = async (req, res, next) => {
  try {
    const point = { lat: Number(req.query.lat), lng: Number(req.query.lng) };
    if (!validPoint(point)) return next(errorHandler(400, 'A valid phone GPS location is required to find nearby moving vehicles.'));
    const radius = Math.min(300, Math.max(1, Number(req.query.radiusKm) || 300));
    const suspendedUsers = await User.find({ accountStatus: 'suspended' }).distinct('_id');
    const vehicles = await MovingVehicle.find({ active: true, verificationStatus: 'approved', driverRef: { $nin: suspendedUsers } }).sort({ updatedAt: -1 }).lean();
    // Allow vehicles reposted or location-updated within the past 24 hours to remain visible on the map.
    const gpsFreshnessLimit = Date.now() - 24 * 60 * 60 * 1000;
    const activeVehicleIds = vehicles.map((vehicle) => vehicle._id);
    const activeRequests = await MovingRequest.find({ vehicleRef: { $in: activeVehicleIds }, status: { $in: ['pending', 'accepted', 'in_progress'] } }).select('vehicleRef').lean();
    const bookedVehicleIds = new Set(activeRequests.map((request) => String(request.vehicleRef)));
    const nearby = vehicles.filter((vehicle) => validPoint(vehicle.currentCoordinates)
      && new Date(vehicle.currentCoordinates?.updatedAt || 0).getTime() >= gpsFreshnessLimit).map((vehicle) => {
      const publicVehicle = { ...vehicle };
      delete publicVehicle.driverPhone;
      delete publicVehicle.vehicleLicenceDocumentUrl;
      delete publicVehicle.verificationReviewedBy;
      delete publicVehicle.verificationReviewNote;
      delete publicVehicle.verificationChecks;
      delete publicVehicle.currentRequestRef;
      delete publicVehicle.liveCoordinates;
      return {
        ...publicVehicle,
        vehicleCategory: 'moving',
        bookingStatus: bookedVehicleIds.has(String(vehicle._id)) || Boolean(vehicle.currentRequestRef) ? 'booked' : 'available',
        distanceKm: Number(distanceKm(point, vehicle.currentCoordinates).toFixed(1)),
        // Preserve the phone's full GPS coordinate precision; rounding to 5 decimals
        // can move the map pin by roughly a metre and exceed the requested tolerance.
        currentCoordinates: { ...vehicle.currentCoordinates, lat: Number(vehicle.currentCoordinates.lat), lng: Number(vehicle.currentCoordinates.lng) },
      };
    }).filter((vehicle) => vehicle.distanceKm <= radius);
    return res.json({ success: true, radiusKm: radius, count: nearby.length, vehicles: nearby });
  } catch (error) { return next(error); }
};

export const createMovingVehicle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+driverVerification');
    if (!user) return next(errorHandler(404, 'User profile not found.'));
    if (user.accountStatus === 'suspended') return next(errorHandler(403, 'Suspended accounts cannot offer moving transport.'));
    if (user.offeringType !== 'shuttle') return next(errorHandler(403, 'Choose Transport Driver in Become before adding a truck or minivan.'));
    if (user.driverVerification?.status !== 'verified'
      || !user.driverVerification?.idDocumentUrl || !user.driverVerification?.facePhotoUrl
      || !user.driverVerification?.licenceDocumentUrl) {
      return next(errorHandler(403, 'Your ID, face photo, and driving licence must be approved before offering moving transport.'));
    }
    const { vehicleType, vehicleDescription, carColor, vehicleImageUrl, driverPhotoUrl, plateNumber, vehicleLicenceDocumentUrl, hourlyRate, callOutFee, description, driverPhone, currentCoordinates } = req.body;
    if (!['mini_truck', 'truck', 'large_truck', 'minivan'].includes(vehicleType)) return next(errorHandler(400, 'Choose a mini truck, truck, or large truck.'));
    if (typeof vehicleDescription !== 'string' || !vehicleDescription.trim()) return next(errorHandler(400, 'Enter the vehicle details.'));
    if (typeof carColor !== 'string' || !carColor.trim()) return next(errorHandler(400, 'Enter the vehicle colour.'));
    const normalizedPlate = String(plateNumber || '').trim().toUpperCase();
    if (!/^[A-Z0-9 -]{3,24}$/.test(normalizedPlate)) return next(errorHandler(400, 'Enter the vehicle registration number plate.'));
    if (!isVehiclePhotoUrl(vehicleImageUrl, req)) return next(errorHandler(400, 'Upload a photo of the vehicle.'));
    if (!isVehicleDocumentUrl(vehicleLicenceDocumentUrl, req)) return next(errorHandler(400, 'Upload the vehicle licence disc or registration document as a PDF.'));
    if (!validMovingLocation(currentCoordinates)) return next(errorHandler(400, movingLocationError));
    const rate = Number(hourlyRate);
    const fee = Number(callOutFee || 0);
    if (!Number.isFinite(rate) || rate < 1 || !Number.isFinite(fee) || fee < 0) return next(errorHandler(400, 'Enter a valid hourly rate and call-out fee.'));
    const contactPhone = String(driverPhone || user.phone || '').trim();
    if (!contactPhone) return next(errorHandler(400, 'Add a contact phone number so customers can reach you.'));
    const existingShuttle = await Shuttle.findOne({ driverRef: user._id, active: true }).select('driverAvatar').sort({ createdAt: -1 }).lean();
    const verifiedDriverPhotoUrl = String(existingShuttle?.driverAvatar || driverPhotoUrl || '').trim();
    if (!isVehiclePhotoUrl(verifiedDriverPhotoUrl, req)) return next(errorHandler(400, 'Upload a clear driver photo, or add a shuttle first to reuse its driver photo.'));
    const vehicle = await MovingVehicle.create({
      driverRef: user._id,
      driverName: user.username || user.name || 'Verified driver',
      driverDisplayName: String(user.name || user.username || '').trim(),
      driverPhone: contactPhone,
      vehicleType,
      vehicleDescription: vehicleDescription.trim(),
      carColor: carColor.trim(),
      vehicleImageUrl: vehicleImageUrl.trim(),
      driverPhotoUrl: verifiedDriverPhotoUrl,
      plateNumber: normalizedPlate,
      vehicleLicenceDocumentUrl: vehicleLicenceDocumentUrl.trim(),
      verificationStatus: 'pending',
      hourlyRate: rate,
      callOutFee: fee,
      description: String(description || '').trim(),
      currentCoordinates: { lat: Number(currentCoordinates.lat), lng: Number(currentCoordinates.lng), address: String(currentCoordinates.address || '').trim(), accuracy: currentCoordinates.locationSource === 'address' ? null : Number(currentCoordinates.accuracy), locationSource: currentCoordinates.locationSource === 'address' ? 'address' : 'gps', updatedAt: new Date() },
    });
    await notifyLoopOutAdmins({
      title: 'Moving vehicle needs review',
      message: `${vehicle.driverDisplayName} submitted ${vehicle.vehicleDescription} (${vehicle.plateNumber}) for moving service approval.`,
      data: { adminAlertType: 'moving_vehicle_review_pending', movingVehicleId: String(vehicle._id), route: '/admin/verification' },
    });
    return res.status(201).json({ success: true, message: 'Vehicle details submitted. Your truck or minivan will appear on the map after an administrator approves it.', vehicle: { ...vehicle.toObject(), vehicleCategory: 'moving' } });
  } catch (error) { return next(error); }
};

export const updateMovingVehicleLocation = async (req, res, next) => {
  try {
    const { currentCoordinates } = req.body;
    if (!validMovingLocation(currentCoordinates)) return next(errorHandler(400, movingLocationError));
    const vehicle = await MovingVehicle.findOneAndUpdate(
      { _id: req.params.id, driverRef: req.user.id, active: true, verificationStatus: 'approved' },
      { $set: { currentCoordinates: { lat: Number(currentCoordinates.lat), lng: Number(currentCoordinates.lng), accuracy: currentCoordinates.locationSource === 'address' ? null : Number(currentCoordinates.accuracy), locationSource: currentCoordinates.locationSource === 'address' ? 'address' : 'gps', address: String(currentCoordinates.address || '').trim(), isLive: false, updatedAt: new Date() } } },
      { new: true, runValidators: true },
    );
    if (!vehicle) return next(errorHandler(404, 'Your approved moving vehicle was not found.'));
    return res.json({ success: true, vehicle: { ...vehicle.toObject(), vehicleCategory: 'moving' } });
  } catch (error) { return next(error); }
};

export const updateMovingVehicleLiveLocation = async (req, res, next) => {
  try {
    const { currentCoordinates } = req.body;
    if (!validPoint(currentCoordinates)) return next(errorHandler(400, 'A valid phone GPS position is required.'));
    const accuracy = Number(currentCoordinates.accuracy);
    if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
      return next(errorHandler(400, 'Live tracking needs a phone GPS fix within 100 m. Move outside and retry.'));
    }
    const activeRequest = await MovingRequest.findOne({
      vehicleRef: req.params.id,
      driverRef: req.user.id,
      status: { $in: ['accepted', 'in_progress'] },
    }).select('_id requesterRef pickupCoordinates livePickupCoordinates driverArrivalNotifiedAt');
    if (!activeRequest) return next(errorHandler(409, 'Live tracking is available only for an accepted moving request.'));
    const vehicle = await MovingVehicle.findOneAndUpdate(
      { _id: req.params.id, driverRef: req.user.id, active: true, verificationStatus: 'approved', currentRequestRef: activeRequest._id },
      { $set: { liveCoordinates: { lat: Number(currentCoordinates.lat), lng: Number(currentCoordinates.lng), accuracy, isLive: true, updatedAt: new Date() } } },
      { new: true, projection: { _id: 1 } },
    );
    if (!vehicle) return next(errorHandler(404, 'Your active moving vehicle was not found.'));
    const livePickupUpdatedAt = activeRequest.livePickupCoordinates?.updatedAt ? new Date(activeRequest.livePickupCoordinates.updatedAt).getTime() : 0;
    const pickupPoint = livePickupUpdatedAt > 0 && Date.now() - livePickupUpdatedAt <= 60000
      ? activeRequest.livePickupCoordinates
      : activeRequest.pickupCoordinates;
    if (!activeRequest.driverArrivalNotifiedAt && validPoint(pickupPoint)
      && distanceKm({ lat: Number(currentCoordinates.lat), lng: Number(currentCoordinates.lng) }, pickupPoint) <= 0.15) {
      const arrivalRecorded = await MovingRequest.findOneAndUpdate(
        { _id: activeRequest._id, driverArrivalNotifiedAt: null },
        { $set: { driverArrivalNotifiedAt: new Date() } },
        { new: true, projection: { _id: 1 } },
      );
      if (arrivalRecorded) {
        await Notification.create({
          userId: activeRequest.requesterRef,
          type: 'shuttle',
          title: 'Your moving driver has arrived',
          message: 'Your truck or minivan has arrived at your pickup point. Please meet the driver when you are ready.',
          data: { movingRequestId: activeRequest._id, route: '/shuttles?vehicleType=moving' },
        });
      }
    }
    return res.json({ success: true, updatedAt: new Date() });
  } catch (error) { return next(error); }
};

export const getMovingRequestLiveLocation = async (req, res, next) => {
  try {
    const request = await MovingRequest.findById(req.params.id).select('requesterRef driverRef vehicleRef status pickupCoordinates livePickupCoordinates pickupAddress').lean();
    if (!request) return next(errorHandler(404, 'Moving request not found.'));
    if (![String(request.requesterRef), String(request.driverRef)].includes(String(req.user.id))) {
      return next(errorHandler(403, 'Only the customer and assigned driver can view live pickup tracking.'));
    }
    if (!['accepted', 'in_progress'].includes(request.status)) {
      return res.json({ success: true, isTracking: false, liveCoordinates: null, pickupCoordinates: request.pickupCoordinates || null, livePickupCoordinates: null });
    }
    const vehicle = await MovingVehicle.findById(request.vehicleRef).select('liveCoordinates').lean();
    const liveCoordinates = vehicle?.liveCoordinates;
    const updatedAt = liveCoordinates?.updatedAt ? new Date(liveCoordinates.updatedAt).getTime() : 0;
    const isTracking = liveCoordinates?.isLive === true && Number.isFinite(updatedAt) && Date.now() - updatedAt >= 0 && Date.now() - updatedAt <= 60000;
    const pickupUpdatedAt = request.livePickupCoordinates?.updatedAt ? new Date(request.livePickupCoordinates.updatedAt).getTime() : 0;
    const hasFreshPickup = Number.isFinite(pickupUpdatedAt) && pickupUpdatedAt > 0 && Date.now() - pickupUpdatedAt >= 0 && Date.now() - pickupUpdatedAt <= 60000;
    return res.json({
      success: true,
      isTracking,
      liveCoordinates: isTracking ? { ...liveCoordinates, lat: Number(liveCoordinates.lat), lng: Number(liveCoordinates.lng) } : null,
      pickupCoordinates: request.pickupCoordinates || null,
      livePickupCoordinates: hasFreshPickup ? { ...request.livePickupCoordinates, lat: Number(request.livePickupCoordinates.lat), lng: Number(request.livePickupCoordinates.lng) } : null,
      pickupAddress: request.pickupAddress,
    });
  } catch (error) { return next(error); }
};

export const updateMovingRequestLivePickup = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    if (!validPoint(coordinates)) return next(errorHandler(400, 'A valid phone GPS position is required.'));
    const accuracy = Number(coordinates.accuracy);
    if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
      return next(errorHandler(400, 'Live pickup sharing needs a phone GPS fix within 100 m.'));
    }
    const request = await MovingRequest.findOneAndUpdate(
      { _id: req.params.id, requesterRef: req.user.id, status: { $in: ['accepted', 'in_progress'] } },
      { $set: { livePickupCoordinates: { lat: Number(coordinates.lat), lng: Number(coordinates.lng), accuracy, updatedAt: new Date() } } },
      { new: true, projection: { _id: 1 } },
    );
    if (!request) return next(errorHandler(409, 'Live pickup sharing is available only after the driver accepts your request.'));
    return res.json({ success: true, updatedAt: new Date() });
  } catch (error) { return next(error); }
};

export const repostMovingVehicle = async (req, res, next) => {
  try {
    const vehicle = await MovingVehicle.findOne({ _id: req.params.id, driverRef: req.user.id, verificationStatus: 'approved' });
    if (!vehicle) return next(errorHandler(404, 'Your approved moving vehicle could not be found.'));
    if (vehicle.currentRequestRef || await MovingRequest.exists({ vehicleRef: vehicle._id, status: { $in: ['pending', 'accepted', 'in_progress'] } })) {
      return next(errorHandler(409, 'This vehicle is booked until you finish the current moving job.'));
    }
    const owner = await User.findById(req.user.id).select('accountStatus offeringType +driverVerification');
    if (!owner || owner.accountStatus === 'suspended' || owner.offeringType !== 'shuttle' || owner.driverVerification?.status !== 'verified') {
      return next(errorHandler(403, 'Your approved transport driver account is required to repost this vehicle.'));
    }

    const { currentCoordinates } = req.body || {};
    let newCoords = null;

    if (currentCoordinates && validMovingLocation(currentCoordinates)) {
      newCoords = {
        lat: Number(currentCoordinates.lat),
        lng: Number(currentCoordinates.lng),
        address: String(currentCoordinates.address || vehicle.currentCoordinates?.address || '').trim(),
        accuracy: currentCoordinates.locationSource === 'address' ? null : (Number.isFinite(Number(currentCoordinates.accuracy)) ? Number(currentCoordinates.accuracy) : null),
        locationSource: currentCoordinates.locationSource === 'address' ? 'address' : 'gps',
        isLive: false,
        updatedAt: new Date(),
      };
    } else if (vehicle.currentCoordinates && validPoint(vehicle.currentCoordinates)) {
      newCoords = {
        lat: Number(vehicle.currentCoordinates.lat),
        lng: Number(vehicle.currentCoordinates.lng),
        address: String(vehicle.currentCoordinates.address || '').trim(),
        accuracy: vehicle.currentCoordinates.accuracy || null,
        locationSource: vehicle.currentCoordinates.locationSource || 'gps',
        isLive: false,
        updatedAt: new Date(),
      };
    } else {
      return next(errorHandler(400, movingLocationError));
    }

    vehicle.active = true;
    vehicle.currentCoordinates = newCoords;
    await vehicle.save();
    return res.json({ success: true, message: 'Your approved vehicle has been reposted with its existing details.', vehicle: { ...vehicle.toObject(), vehicleCategory: 'moving' } });
  } catch (error) { return next(error); }
};

export const closeMovingVehicle = async (req, res, next) => {
  try {
    const vehicle = await MovingVehicle.findOne({ _id: req.params.id, driverRef: req.user.id, verificationStatus: 'approved' });
    if (!vehicle) return next(errorHandler(404, 'Your approved moving vehicle could not be found.'));
    if (vehicle.currentRequestRef || await MovingRequest.exists({ vehicleRef: vehicle._id, status: { $in: ['pending', 'accepted', 'in_progress'] } })) {
      return next(errorHandler(409, 'This vehicle is booked. Finish, decline, or cancel the current request before taking it off the map.'));
    }
    const closedVehicle = await MovingVehicle.findOneAndUpdate(
      { _id: vehicle._id, driverRef: req.user.id, verificationStatus: 'approved', active: true, $or: [{ currentRequestRef: null }, { currentRequestRef: { $exists: false } }] },
      { $set: { active: false } },
      { new: true },
    );
    if (!closedVehicle) {
      const latestVehicle = await MovingVehicle.findOne({ _id: vehicle._id, driverRef: req.user.id, verificationStatus: 'approved' }).lean();
      if (latestVehicle && !latestVehicle.active && !latestVehicle.currentRequestRef) {
        return res.json({ success: true, message: 'This approved vehicle is already closed and hidden from the map.', vehicle: latestVehicle });
      }
      return next(errorHandler(409, 'This vehicle changed while closing. Refresh and try again.'));
    }
    return res.json({ success: true, message: 'Your vehicle is closed and no longer appears on the map.', vehicle: closedVehicle });
  } catch (error) { return next(error); }
};

export const getMyMovingVehicles = async (req, res, next) => {
  try {
    const vehicles = await MovingVehicle.find({ driverRef: req.user.id }).sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, vehicles: vehicles.map((vehicle) => ({ ...vehicle, vehicleCategory: 'moving' })) });
  } catch (error) { return next(error); }
};

export const getPendingMovingVehicleReviews = async (req, res, next) => {
  try {
    const vehicles = await MovingVehicle.find({ verificationStatus: 'pending' })
      .populate('driverRef', 'username name email')
      .sort({ verificationSubmittedAt: 1, _id: 1 })
      .lean();
    return res.json({ success: true, vehicles });
  } catch (error) { return next(error); }
};

export const reviewMovingVehicle = async (req, res, next) => {
  try {
    const { status, checks = {}, note = '' } = req.body;
    if (!['approved', 'rejected'].includes(status)) return next(errorHandler(400, 'Choose approve or reject.'));
    const reviewChecks = {
      plateMatchesDocument: checks.plateMatchesDocument === true,
      driverMatchesApprovedAccount: checks.driverMatchesApprovedAccount === true,
      vehicleDetailsMatch: checks.vehicleDetailsMatch === true,
      vehiclePhotoMatchesDetails: checks.vehiclePhotoMatchesDetails === true,
    };
    if (status === 'approved' && !Object.values(reviewChecks).every(Boolean)) return next(errorHandler(400, 'Confirm the registration plate, approved driver account, vehicle details, and vehicle photo before approval.'));
    if (status === 'rejected' && !String(note).trim()) return next(errorHandler(400, 'Add a reason so the driver knows what to correct.'));
    const vehicle = await MovingVehicle.findOne({ _id: req.params.vehicleId, verificationStatus: 'pending' });
    if (!vehicle) return next(errorHandler(404, 'Pending moving vehicle review not found.'));
    if (!isVehicleDocumentUrl(vehicle.vehicleLicenceDocumentUrl, req)) return next(errorHandler(400, 'The vehicle registration PDF is missing or has an invalid link.'));
    if (!isVehiclePhotoUrl(vehicle.vehicleImageUrl, req) || !isVehiclePhotoUrl(vehicle.driverPhotoUrl, req)) return next(errorHandler(400, 'A required vehicle or driver photo is missing or has an invalid link.'));
    const owner = await User.findById(vehicle.driverRef).select('+driverVerification');
    if (!owner || owner.driverVerification?.status !== 'verified') return next(errorHandler(409, 'The listed driver account is no longer approved. Do not approve this vehicle until the driver account is approved again.'));
    vehicle.verificationStatus = status;
    vehicle.verificationReviewedAt = new Date();
    vehicle.verificationReviewedBy = req.user.id;
    vehicle.verificationReviewNote = String(note).trim().slice(0, 500);
    vehicle.verificationChecks = reviewChecks;
    await vehicle.save();
    await Notification.create({
      userId: vehicle.driverRef,
      type: 'shuttle',
      title: status === 'approved' ? 'Moving vehicle approved' : 'Moving vehicle needs changes',
      message: status === 'approved'
        ? `${vehicle.vehicleDescription} (${vehicle.plateNumber}) is approved and can now appear to nearby customers.`
        : `Your ${vehicle.vehicleDescription} listing needs changes: ${vehicle.verificationReviewNote}`,
      data: { movingVehicleId: vehicle._id, verificationStatus: status, route: '/shuttles?tab=moving-requests' },
    });
    return res.json({ success: true, status, vehicleId: vehicle._id });
  } catch (error) { return next(error); }
};

export const createMovingRequest = async (req, res, next) => {
  try {
    const { vehicleId, requesterName, requesterPhone, pickupAddress, pickupCoordinates, dropoffAddress, itemDescription, requestedAt } = req.body;
    const vehicle = await MovingVehicle.findOne({ _id: vehicleId, active: true, verificationStatus: 'approved' });
    if (!vehicle) return next(errorHandler(404, 'This moving vehicle is no longer available.'));
    if (vehicle.currentRequestRef || await MovingRequest.exists({ vehicleRef: vehicle._id, status: { $in: ['pending', 'accepted', 'in_progress'] } })) return next(errorHandler(409, 'This vehicle is already booked. Wait for the driver to finish or decline the current request.'));
    if (String(vehicle.driverRef) === String(req.user.id)) return next(errorHandler(400, 'You cannot request your own vehicle.'));
    const provider = await User.findOne({ _id: vehicle.driverRef, accountStatus: { $ne: 'suspended' } }).select('_id');
    if (!provider) return next(errorHandler(404, 'This moving vehicle is no longer available.'));
    const date = new Date(requestedAt);
    if (![requesterName, requesterPhone, pickupAddress, dropoffAddress, itemDescription].every((value) => typeof value === 'string' && value.trim()) || Number.isNaN(date.getTime()) || date < new Date()) {
      return next(errorHandler(400, 'Enter your contact details, pickup and drop-off, items to move, and a future pickup time.'));
    }
    if (pickupCoordinates && !validPoint(pickupCoordinates)) return next(errorHandler(400, 'Pickup GPS coordinates are invalid.'));
    const request = new MovingRequest({
      vehicleRef: vehicle._id, requesterRef: req.user.id, driverRef: vehicle.driverRef,
      requesterName: requesterName.trim(), requesterPhone: requesterPhone.trim(),
      pickupAddress: pickupAddress.trim(), pickupCoordinates: validPoint(pickupCoordinates) ? { lat: Number(pickupCoordinates.lat), lng: Number(pickupCoordinates.lng) } : undefined,
      dropoffAddress: dropoffAddress.trim(), itemDescription: itemDescription.trim(), requestedAt: date,
    });
    const claimedVehicle = await MovingVehicle.findOneAndUpdate(
      { _id: vehicle._id, active: true, verificationStatus: 'approved', $or: [{ currentRequestRef: null }, { currentRequestRef: { $exists: false } }] },
      { $set: { currentRequestRef: request._id } },
      { new: true },
    );
    if (!claimedVehicle) return next(errorHandler(409, 'This vehicle was just booked by another customer.'));
    try {
      await request.save();
    } catch (saveError) {
      await MovingVehicle.updateOne({ _id: vehicle._id, currentRequestRef: request._id }, { $set: { currentRequestRef: null } }).catch(() => {});
      throw saveError;
    }
    await Notification.create({ userId: vehicle.driverRef, type: 'shuttle', title: 'New moving help request', message: `${request.requesterName} requested your ${vehicle.vehicleType} to move items. Review the pickup and job details.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    return res.status(201).json({ success: true, message: 'Your request was sent to the driver.', request });
  } catch (error) { return next(error); }
};

export const getMyMovingRequests = async (req, res, next) => {
  try {
    const role = req.query.role === 'driver' ? 'driverRef' : 'requesterRef';
    const requests = await MovingRequest.find({ [role]: req.user.id })
      .populate({ path: 'vehicleRef', select: 'vehicleType vehicleDescription carColor vehicleImageUrl driverPhotoUrl plateNumber hourlyRate callOutFee description currentCoordinates verificationStatus verificationReviewNote driverName driverDisplayName driverPhone' })
      .sort({ createdAt: -1 }).lean();
    if (role === 'requesterRef') requests.forEach((request) => {
      if (!['accepted', 'service_completed', 'payment_reported', 'paid', 'completed'].includes(request.status) && request.vehicleRef) delete request.vehicleRef.driverPhone;
    });
    return res.json({ success: true, requests });
  } catch (error) { return next(error); }
};

export const updateMovingRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined', 'cancelled', 'in_progress', 'quote_proposed', 'quote_accepted', 'quote_declined', 'service_completed', 'payment_reported', 'paid'].includes(status)) {
      return next(errorHandler(400, 'Choose an available job or payment action.'));
    }
    const request = await MovingRequest.findById(req.params.id);
    if (!request) return next(errorHandler(404, 'Moving request not found.'));

    if (status === 'accepted' || status === 'declined') {
      if (String(request.driverRef) !== String(req.user.id) || request.status !== 'pending') return next(errorHandler(409, 'Only the assigned driver can accept or decline a pending request.'));
      if (status === 'accepted') {
        if (await MovingRequest.exists({ vehicleRef: request.vehicleRef, _id: { $ne: request._id }, status: { $in: ['pending', 'accepted', 'in_progress'] } })) return next(errorHandler(409, 'This vehicle already has another moving request.'));
        const claimedVehicle = await MovingVehicle.findOneAndUpdate(
          { _id: request.vehicleRef, driverRef: req.user.id, active: true, verificationStatus: 'approved', $or: [{ currentRequestRef: request._id }, { currentRequestRef: null }, { currentRequestRef: { $exists: false } }] },
          { $set: { currentRequestRef: request._id } },
          { new: true },
        );
        if (!claimedVehicle) return next(errorHandler(409, 'This vehicle is already booked or no longer available.'));
      }
      request.status = status;
    } else if (status === 'cancelled') {
      const isRequester = String(request.requesterRef) === String(req.user.id);
      const isDriver = String(request.driverRef) === String(req.user.id);
      if ((!isRequester && !isDriver) || !['pending', 'accepted'].includes(request.status)) return next(errorHandler(409, 'Only the customer or assigned driver can cancel before the move starts.'));
      const reason = String(req.body.reason || '').trim();
      if (reason.length < 3) return next(errorHandler(400, 'Add a short reason for cancelling this move.'));
      request.status = 'cancelled';
      request.cancelledAt = new Date();
      request.cancelledBy = req.user.id;
      request.cancelledByRole = isDriver ? 'driver' : 'requester';
      request.cancellationReason = reason.slice(0, 500);
    } else if (status === 'in_progress') {
      if (String(request.driverRef) !== String(req.user.id) || request.status !== 'accepted' || request.quoteStatus !== 'accepted') return next(errorHandler(409, 'The driver can start the move only after the customer approves the quote.'));
      request.status = 'in_progress';
    } else if (status === 'quote_proposed') {
      if (String(request.driverRef) !== String(req.user.id) || request.status !== 'accepted') return next(errorHandler(409, 'Only the assigned driver can quote an accepted moving request.'));
      if (request.quoteStatus === 'pending' || request.quoteStatus === 'accepted') return next(errorHandler(409, 'Wait for the customer to respond before changing this quote.'));
      const quoteAmount = Number(req.body.quoteAmount);
      if (!Number.isFinite(quoteAmount) || quoteAmount <= 0 || quoteAmount > 10000000) return next(errorHandler(400, 'Enter a valid moving quote amount.'));
      request.quoteAmount = Math.round(quoteAmount * 100) / 100;
      request.quoteStatus = 'pending';
      request.quoteProposedAt = new Date();
      request.quoteRespondedAt = null;
    } else if (status === 'quote_accepted' || status === 'quote_declined') {
      if (String(request.requesterRef) !== String(req.user.id) || request.status !== 'accepted' || request.quoteStatus !== 'pending') return next(errorHandler(409, 'Only the customer can respond to a pending moving quote.'));
      request.quoteStatus = status === 'quote_accepted' ? 'accepted' : 'declined';
      request.quoteRespondedAt = new Date();
    } else if (status === 'service_completed') {
      if (String(request.driverRef) !== String(req.user.id) || request.status !== 'in_progress') return next(errorHandler(409, 'Only the assigned driver can mark an in-progress move as provided.'));
      if (request.quoteStatus !== 'accepted' || !Number.isFinite(Number(request.quoteAmount)) || Number(request.quoteAmount) <= 0) return next(errorHandler(409, 'The customer must approve the moving quote before the service can be marked complete.'));
      request.finalPrice = request.quoteAmount;
      request.serviceCompletedAt = new Date();
      request.status = 'service_completed';
    } else if (status === 'payment_reported') {
      if (String(request.requesterRef) !== String(req.user.id) || request.status !== 'service_completed') return next(errorHandler(409, 'Payment can only be reported by the customer after the driver marks the service complete.'));
      if (!['cash', 'eft'].includes(req.body.paymentMethod)) return next(errorHandler(400, 'Choose cash or EFT after you have paid the driver.'));
      request.paymentMethod = req.body.paymentMethod;
      request.paymentReportedAt = new Date();
      request.status = 'payment_reported';
    } else if (status === 'paid') {
      if (String(request.driverRef) !== String(req.user.id) || request.status !== 'payment_reported') return next(errorHandler(409, 'Only the assigned driver can confirm the customer-reported payment.'));
      request.paymentConfirmedAt = new Date();
      request.status = 'paid';
    }

    try {
      await request.save();
    } catch (saveError) {
      if (status === 'accepted') await MovingVehicle.updateOne({ _id: request.vehicleRef, currentRequestRef: request._id }, { $set: { currentRequestRef: null } }).catch(() => {});
      throw saveError;
    }
    if (status === 'cancelled' || status === 'declined' || status === 'service_completed') {
      await MovingVehicle.updateOne({ _id: request.vehicleRef, currentRequestRef: request._id }, {
        $set: {
          currentRequestRef: null,
          liveCoordinates: { lat: null, lng: null, accuracy: null, isLive: false, updatedAt: null },
          // The request will no longer expose a live customer pickup once it ends.
        },
      }).catch(() => {});
      await MovingRequest.updateOne({ _id: request._id }, { $set: { livePickupCoordinates: { lat: null, lng: null, accuracy: null, updatedAt: null } } }).catch(() => {});
    }

    if (status === 'accepted' || status === 'declined') {
      await Notification.create({ userId: request.requesterRef, type: 'shuttle', title: `Moving request ${status}`, message: status === 'accepted' ? 'The driver accepted your moving request. No payment is due now; pay only after the service is provided.' : 'The driver declined your moving request.', data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else if (status === 'cancelled') {
      const recipient = String(request.cancelledBy) === String(request.driverRef) ? request.requesterRef : request.driverRef;
      await Notification.create({ userId: recipient, type: 'shuttle', title: 'Moving request cancelled', message: `The ${request.cancelledByRole} cancelled the move: ${request.cancellationReason}`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else if (status === 'in_progress') {
      await Notification.create({ userId: request.requesterRef, type: 'shuttle', title: 'Your move has started', message: 'The driver marked the moving service as in progress.', data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else if (status === 'quote_proposed') {
      await Notification.create({ userId: request.requesterRef, type: 'shuttle', title: 'Moving price quote needs your approval', message: `The driver quoted R${request.quoteAmount.toFixed(2)} for your move. Review and approve the price before the service starts. Payment is still due only after the move is complete.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else if (status === 'quote_accepted') {
      await Notification.create({ userId: request.driverRef, type: 'shuttle', title: 'Customer approved your moving quote', message: `The customer approved the R${request.quoteAmount.toFixed(2)} moving quote. Payment is due only after the move is complete.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else if (status === 'quote_declined') {
      await Notification.create({ userId: request.driverRef, type: 'shuttle', title: 'Customer declined your moving quote', message: 'The customer declined the price. You can send a revised quote for approval before starting the move.', data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else if (status === 'service_completed') {
      await Notification.create({ userId: request.requesterRef, type: 'shuttle', title: 'Moving service provided · payment due', message: `The driver marked the move complete. Pay the agreed R${request.finalPrice.toFixed(2)} directly to the driver now by cash or EFT, then report payment in Moving requests. LoopOut has not collected payment.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else if (status === 'payment_reported') {
      await Notification.create({ userId: request.driverRef, type: 'shuttle', title: 'Customer reports moving payment sent', message: `The customer reports paying R${request.finalPrice.toFixed(2)} by ${request.paymentMethod.toUpperCase()}. Confirm receipt only after you have received it.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    } else {
      await Notification.create({ userId: request.requesterRef, type: 'shuttle', title: 'Moving payment receipt confirmed', message: `The driver confirmed receiving R${request.finalPrice.toFixed(2)}. This moving job is marked paid.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    }
    return res.json({ success: true, request });
  } catch (error) { return next(error); }
};

export const reportMovingIssue = async (req, res, next) => {
  try {
    const request = await MovingRequest.findById(req.params.id);
    if (!request) return next(errorHandler(404, 'Moving request not found.'));
    const isRequester = String(request.requesterRef) === String(req.user.id);
    const isDriver = String(request.driverRef) === String(req.user.id);
    if (!isRequester && !isDriver) return next(errorHandler(403, 'Only the customer or assigned driver can report an issue.'));
    if (!['accepted', 'in_progress', 'service_completed', 'payment_reported', 'paid', 'cancelled'].includes(request.status)) return next(errorHandler(409, 'Issues can be reported after the driver accepts the request.'));
    if (request.issueStatus && request.issueStatus !== 'none') return next(errorHandler(409, 'An issue has already been reported for this move.'));
    const allowedTypes = ['driver_no_show', 'late_pickup', 'customer_no_show', 'damage', 'price_dispute', 'safety', 'other'];
    const issueType = String(req.body.issueType || 'other');
    const description = String(req.body.description || '').trim();
    if (!allowedTypes.includes(issueType) || description.length < 10) return next(errorHandler(400, 'Choose an issue type and describe what happened in at least 10 characters.'));
    request.issueStatus = 'open';
    request.issueType = issueType;
    request.issueDescription = description.slice(0, 1000);
    request.issueReportedBy = req.user.id;
    request.issueReportedByRole = isDriver ? 'driver' : 'requester';
    request.issueReportedAt = new Date();
    await request.save();
    const recipient = isDriver ? request.requesterRef : request.driverRef;
    await Notification.create({ userId: recipient, type: 'shuttle', title: 'Issue reported for a moving request', message: `A ${issueType.replace(/_/g, ' ')} issue was reported. LoopOut support has been notified.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    await notifyLoopOutAdmins({ title: 'Moving service issue needs review', message: `${issueType.replace(/_/g, ' ')} reported for moving request ${request._id}: ${description.slice(0, 180)}`, data: { movingRequestId: String(request._id), route: '/admin/verification?tab=moving-issues' } });
    return res.status(201).json({ success: true, request });
  } catch (error) { return next(error); }
};

export const rateMovingService = async (req, res, next) => {
  try {
    const stars = Number(req.body.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return next(errorHandler(400, 'Choose a rating from 1 to 5 stars.'));
    const request = await MovingRequest.findById(req.params.id);
    if (!request) return next(errorHandler(404, 'Moving request not found.'));
    if (String(request.requesterRef) !== String(req.user.id)) return next(errorHandler(403, 'Only the customer can rate this moving service.'));
    if (request.status !== 'paid') return next(errorHandler(409, 'You can rate the driver after the service is complete and payment is confirmed.'));
    const reviewedRequest = await MovingRequest.findOneAndUpdate(
      { _id: request._id, requesterRef: req.user.id, status: 'paid', ratingStars: null },
      { $set: { ratingStars: stars, ratingReview: String(req.body.review || '').trim().slice(0, 500), ratedAt: new Date() } },
      { new: true, runValidators: true },
    );
    if (!reviewedRequest) return next(errorHandler(409, 'You have already rated this moving service.'));
    await MovingVehicle.updateOne({ _id: request.vehicleRef }, { $inc: { ratingTotal: stars, ratingCount: 1 } });
    const vehicle = await MovingVehicle.findById(request.vehicleRef).select('ratingTotal ratingCount').lean();
    await Notification.create({ userId: request.driverRef, type: 'shuttle', title: 'New moving service rating', message: `A customer rated your moving service ${stars} out of 5 stars.`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    return res.json({ success: true, rating: { stars, review: reviewedRequest.ratingReview, average: vehicle?.ratingCount ? vehicle.ratingTotal / vehicle.ratingCount : stars, count: vehicle?.ratingCount || 1 } });
  } catch (error) { return next(error); }
};

export const getPendingMovingIssues = async (req, res, next) => {
  try {
    const requests = await MovingRequest.find({ issueStatus: 'open' })
      .populate('requesterRef', 'username name email phone')
      .populate('driverRef', 'username name email phone')
      .populate('vehicleRef', 'vehicleDescription vehicleType plateNumber')
      .sort({ issueReportedAt: 1 }).lean();
    return res.json({ success: true, requests });
  } catch (error) { return next(error); }
};

export const resolveMovingIssue = async (req, res, next) => {
  try {
    const note = String(req.body.note || '').trim();
    if (note.length < 5) return next(errorHandler(400, 'Add a resolution note of at least 5 characters.'));
    const request = await MovingRequest.findOneAndUpdate({ _id: req.params.id, issueStatus: 'open' }, { $set: { issueStatus: 'resolved', issueResolutionNote: note.slice(0, 1000), issueResolvedAt: new Date(), issueResolvedBy: req.user.id } }, { new: true });
    if (!request) return next(errorHandler(404, 'Open moving issue not found.'));
    for (const userId of [request.requesterRef, request.driverRef]) {
      await Notification.create({ userId, type: 'shuttle', title: 'Moving issue reviewed', message: `LoopOut support reviewed the reported issue: ${note.slice(0, 220)}`, data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
    }
    return res.json({ success: true, requestId: request._id });
  } catch (error) { return next(error); }
};
