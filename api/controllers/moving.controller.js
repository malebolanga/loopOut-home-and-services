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
    const radius = Math.min(50, Math.max(1, Number(req.query.radiusKm) || 50));
    const suspendedUsers = await User.find({ accountStatus: 'suspended' }).distinct('_id');
    const vehicles = await MovingVehicle.find({ active: true, verificationStatus: 'approved', driverRef: { $nin: suspendedUsers } }).sort({ updatedAt: -1 }).lean();
    const gpsFreshnessLimit = Date.now() - 24 * 60 * 60 * 1000;
    const nearby = vehicles.filter((vehicle) => new Date(vehicle.currentCoordinates?.updatedAt || 0).getTime() >= gpsFreshnessLimit).map((vehicle) => {
      const publicVehicle = { ...vehicle };
      delete publicVehicle.driverPhone;
      delete publicVehicle.vehicleLicenceDocumentUrl;
      delete publicVehicle.verificationReviewedBy;
      delete publicVehicle.verificationReviewNote;
      delete publicVehicle.verificationChecks;
      return {
        ...publicVehicle,
        vehicleCategory: 'moving',
        distanceKm: Number(distanceKm(point, vehicle.currentCoordinates).toFixed(1)),
        currentCoordinates: { ...vehicle.currentCoordinates, lat: Number(vehicle.currentCoordinates.lat.toFixed(2)), lng: Number(vehicle.currentCoordinates.lng.toFixed(2)) },
      };
    }).filter((vehicle) => vehicle.distanceKm <= Math.min(radius, vehicle.serviceRadiusKm || 50));
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
    if (!['truck', 'minivan'].includes(vehicleType)) return next(errorHandler(400, 'Choose a truck or minivan.'));
    if (typeof vehicleDescription !== 'string' || !vehicleDescription.trim()) return next(errorHandler(400, 'Enter the truck or minivan details.'));
    if (typeof carColor !== 'string' || !carColor.trim()) return next(errorHandler(400, 'Enter the truck or minivan colour.'));
    const normalizedPlate = String(plateNumber || '').trim().toUpperCase();
    if (!/^[A-Z0-9 -]{3,24}$/.test(normalizedPlate)) return next(errorHandler(400, 'Enter the truck or minivan registration number plate.'));
    if (!isVehiclePhotoUrl(vehicleImageUrl, req)) return next(errorHandler(400, 'Upload a photo of the truck or minivan.'));
    if (!isVehicleDocumentUrl(vehicleLicenceDocumentUrl, req)) return next(errorHandler(400, 'Upload the vehicle licence disc or registration document as a PDF.'));
    if (!validPoint(currentCoordinates)) return next(errorHandler(400, 'Allow phone GPS and capture your current vehicle location before listing.'));
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
      currentCoordinates: { lat: Number(currentCoordinates.lat), lng: Number(currentCoordinates.lng), address: String(currentCoordinates.address || '').trim(), accuracy: Number(currentCoordinates.accuracy) || null, updatedAt: new Date() },
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
    if (!validPoint(currentCoordinates)) return next(errorHandler(400, 'Valid phone GPS coordinates are required.'));
    const vehicle = await MovingVehicle.findOneAndUpdate(
      { _id: req.params.id, driverRef: req.user.id, active: true, verificationStatus: 'approved' },
      { $set: { currentCoordinates: { lat: Number(currentCoordinates.lat), lng: Number(currentCoordinates.lng), accuracy: Number(currentCoordinates.accuracy) || null, address: String(currentCoordinates.address || '').trim(), isLive: false, updatedAt: new Date() } } },
      { new: true, runValidators: true },
    );
    if (!vehicle) return next(errorHandler(404, 'Your approved moving vehicle was not found.'));
    return res.json({ success: true, vehicle: { ...vehicle.toObject(), vehicleCategory: 'moving' } });
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
    if (String(vehicle.driverRef) === String(req.user.id)) return next(errorHandler(400, 'You cannot request your own vehicle.'));
    const provider = await User.findOne({ _id: vehicle.driverRef, accountStatus: { $ne: 'suspended' } }).select('_id');
    if (!provider) return next(errorHandler(404, 'This moving vehicle is no longer available.'));
    const date = new Date(requestedAt);
    if (![requesterName, requesterPhone, pickupAddress, dropoffAddress, itemDescription].every((value) => typeof value === 'string' && value.trim()) || Number.isNaN(date.getTime()) || date < new Date()) {
      return next(errorHandler(400, 'Enter your contact details, pickup and drop-off, items to move, and a future pickup time.'));
    }
    if (pickupCoordinates && !validPoint(pickupCoordinates)) return next(errorHandler(400, 'Pickup GPS coordinates are invalid.'));
    const request = await MovingRequest.create({
      vehicleRef: vehicle._id, requesterRef: req.user.id, driverRef: vehicle.driverRef,
      requesterName: requesterName.trim(), requesterPhone: requesterPhone.trim(),
      pickupAddress: pickupAddress.trim(), pickupCoordinates: validPoint(pickupCoordinates) ? { lat: Number(pickupCoordinates.lat), lng: Number(pickupCoordinates.lng) } : undefined,
      dropoffAddress: dropoffAddress.trim(), itemDescription: itemDescription.trim(), requestedAt: date,
    });
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
    if (!['accepted', 'declined', 'service_completed', 'payment_reported', 'paid'].includes(status)) {
      return next(errorHandler(400, 'Choose an available job or payment action.'));
    }
    const request = await MovingRequest.findById(req.params.id);
    if (!request) return next(errorHandler(404, 'Moving request not found.'));

    if (status === 'accepted' || status === 'declined') {
      if (String(request.driverRef) !== String(req.user.id) || request.status !== 'pending') return next(errorHandler(409, 'Only the assigned driver can accept or decline a pending request.'));
      request.status = status;
    } else if (status === 'service_completed') {
      if (String(request.driverRef) !== String(req.user.id) || request.status !== 'accepted') return next(errorHandler(409, 'Only the assigned driver can mark an accepted job as provided.'));
      const finalPrice = Number(req.body.finalPrice);
      if (!Number.isFinite(finalPrice) || finalPrice <= 0) return next(errorHandler(400, 'Enter the agreed final amount after the moving service has been provided.'));
      request.finalPrice = Math.round(finalPrice * 100) / 100;
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

    await request.save();

    if (status === 'accepted' || status === 'declined') {
      await Notification.create({ userId: request.requesterRef, type: 'shuttle', title: `Moving request ${status}`, message: status === 'accepted' ? 'The driver accepted your moving request. No payment is due now; pay only after the service is provided.' : 'The driver declined your moving request.', data: { movingRequestId: request._id, route: '/shuttles?tab=moving-requests' } });
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
