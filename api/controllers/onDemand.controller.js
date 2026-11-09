import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import OnDemandJob from '../models/OnDemandJob.js';
import Notification from '../models/notification.model.js';
import { sendPushNotificationToUser } from '../utils/pushNotifications.js';

const EARTH_RADIUS_KM = 6371;
const ONLINE_STALE_MS = 10 * 60 * 1000;
const ALLOWED_TYPES = new Set(['cleaning', 'domestic', 'maid', 'nanny', 'handyman', 'errand', 'moving', 'carwash', 'barber', 'beauty', 'tattoo', 'chef', 'photography', 'baker', 'tutor', 'sneaker', 'washingmat', 'animals', 'landscaping', 'catering', 'daycare', 'storage', 'other']);
const userId = (req) => req.user?.id;
const distanceKm = (aLat, aLng, bLat, bLng) => {
  const rad = (value) => value * Math.PI / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const term = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(term));
};
const validCoords = (lat, lng) => Number.isFinite(Number(lat)) && Number(lat) >= -90 && Number(lat) <= 90 && Number.isFinite(Number(lng)) && Number(lng) >= -180 && Number(lng) <= 180;

const notify = async (recipient, title, message, job, extra = {}) => {
  try {
    await Notification.create({
      userId: recipient,
      type: 'booking',
      title,
      message,
      data: { serviceRequestId: String(job._id), link: '/work-now', ...extra },
    });
    sendPushNotificationToUser(recipient, { title, body: message, data: { type: 'service_request', serviceRequestId: String(job._id), route: '/work-now' } }).catch(() => {});
  } catch (error) {
    console.warn('[onDemand] notification failed:', error.message);
  }
};

export const getWorkerAvailability = async (req, res) => {
  const user = await User.findById(userId(req)).select('workerAvailability');
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  res.json({ availability: user.workerAvailability || { online: false, serviceTypes: [] } });
};

export const updateWorkerAvailability = async (req, res) => {
  const id = userId(req);
  const online = req.body.online === true;
  const { latitude, longitude } = req.body;
  if (online && !validCoords(latitude, longitude)) return res.status(400).json({ message: 'Allow location access to go online for nearby service requests.' });

  const [helpers, services] = await Promise.all([
    Helper.find({ userRef: id }).select('type'),
    Service.find({ $or: [{ userRef: id }, { creator: id }] }).select('type'),
  ]);
  if (!helpers.length && !services.length) return res.status(403).json({ message: 'Create a helper or service listing before going online.' });
  const serviceTypes = [...new Set([...helpers, ...services].map((item) => String(item.type || '').trim().toLowerCase()).filter((type) => ALLOWED_TYPES.has(type)))];
  if (online && !serviceTypes.length) return res.status(400).json({ message: 'Your current listings do not match an on-demand service category yet.' });

  const availability = { online, serviceTypes: online ? serviceTypes : [], updatedAt: new Date() };
  if (online) {
    availability.latitude = Number(latitude);
    availability.longitude = Number(longitude);
  }
  const update = online
    ? { $set: { workerAvailability: availability } }
    : { $set: { 'workerAvailability.online': false, 'workerAvailability.serviceTypes': [], 'workerAvailability.updatedAt': new Date() }, $unset: { 'workerAvailability.latitude': 1, 'workerAvailability.longitude': 1 } };
  const user = await User.findByIdAndUpdate(id, update, { new: true }).select('workerAvailability');
  res.json({ availability: user.workerAvailability });
};

export const createOnDemandJob = async (req, res) => {
  const customerId = userId(req);
  const serviceType = String(req.body.serviceType || '').trim().toLowerCase();
  const description = String(req.body.description || '').trim().slice(0, 1200);
  const address = String(req.body.address || '').trim().slice(0, 500);
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);
  const scheduledFor = new Date(req.body.scheduledFor);
  const budget = Number(req.body.budget || 0);
  const radiusKm = Math.min(50, Math.max(1, Number(req.body.radiusKm) || 15));
  if (!ALLOWED_TYPES.has(serviceType) || !description || !address || !validCoords(latitude, longitude) || !Number.isFinite(scheduledFor.getTime()) || scheduledFor <= new Date() || !Number.isFinite(budget) || budget < 0) {
    return res.status(400).json({ message: 'Enter a service, job description, future time, address and valid location.' });
  }

  const onlineWorkers = await User.find({
    _id: { $ne: customerId },
    'workerAvailability.online': true,
    'workerAvailability.serviceTypes': serviceType,
    'workerAvailability.updatedAt': { $gte: new Date(Date.now() - ONLINE_STALE_MS) },
  }).select('_id username workerAvailability');
  const candidates = onlineWorkers.filter((worker) => {
    const location = worker.workerAvailability || {};
    return validCoords(location.latitude, location.longitude) && distanceKm(latitude, longitude, Number(location.latitude), Number(location.longitude)) <= radiusKm;
  });
  if (!candidates.length) return res.status(409).json({ message: `No ${serviceType} workers are online within ${radiusKm} km right now. Try a larger area or schedule later.` });

  const job = await OnDemandJob.create({
    customer: customerId, serviceType, description, address, latitude, longitude, scheduledFor, budget, radiusKm,
    offeredTo: candidates.map((worker) => worker._id), status: 'searching',
  });
  const customer = await User.findById(customerId).select('username');
  await Promise.all(candidates.map((worker) => notify(
    worker._id,
    'Nearby service request',
    `${customer?.username || 'A customer'} needs ${serviceType} help ${distanceKm(latitude, longitude, worker.workerAvailability.latitude, worker.workerAvailability.longitude).toFixed(1)} km away. Open Work Now to respond.`,
    job,
  )));
  res.status(201).json({ job, matchedWorkers: candidates.length });
};

export const listOnDemandJobs = async (req, res) => {
  const id = userId(req);
  const jobs = await OnDemandJob.find({ $or: [{ customer: id }, { offeredTo: id }, { acceptedBy: id }] })
    .sort({ createdAt: -1 }).limit(100)
    .populate('customer', 'username avatar phone')
    .populate('acceptedBy', 'username avatar phone');
  const safeJobs = jobs.map((job) => {
    const result = job.toObject();
    const isCustomer = String(result.customer?._id || result.customer) === String(id);
    const isAssignedWorker = String(result.acceptedBy?._id || result.acceptedBy || '') === String(id);
    if (!isCustomer && !isAssignedWorker) {
      result.address = 'Exact address shared after a worker accepts.';
      delete result.latitude;
      delete result.longitude;
      if (result.customer && typeof result.customer === 'object') delete result.customer.phone;
    }
    return result;
  });
  res.json({ jobs: safeJobs });
};

export const respondToOnDemandJob = async (req, res) => {
  const id = userId(req);
  const jobId = req.params.jobId;
  if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ message: 'Invalid service request.' });
  const action = req.body.action;
  if (action === 'accept') {
    const job = await OnDemandJob.findOneAndUpdate(
      { _id: jobId, status: 'searching', offeredTo: id, acceptedBy: null },
      { $set: { acceptedBy: id, status: 'accepted' } },
      { new: true },
    ).populate('customer', 'username avatar phone');
    if (!job) return res.status(409).json({ message: 'This request was already claimed or is no longer available.' });
    await notify(job.customer._id, 'Worker accepted your request', `A nearby worker accepted your ${job.serviceType} request.`, job, { status: job.status });
    return res.json({ job });
  }
  if (action === 'decline') {
    const job = await OnDemandJob.findOneAndUpdate(
      { _id: jobId, status: 'searching', offeredTo: id },
      { $addToSet: { declinedBy: id } },
      { new: true },
    );
    if (!job) return res.status(409).json({ message: 'This request is no longer available.' });
    if (job.offeredTo.length && job.offeredTo.every((workerId) => job.declinedBy.some((declinedId) => String(declinedId) === String(workerId)))) {
      const unmatchedJob = await OnDemandJob.findOneAndUpdate({ _id: job._id, status: 'searching', acceptedBy: null }, { $set: { status: 'unmatched' } }, { new: true });
      if (unmatchedJob) await notify(unmatchedJob.customer, 'No worker accepted yet', 'No nearby worker accepted this request. Try again later or choose a specific provider.', unmatchedJob, { status: 'unmatched' });
    }
    return res.json({ job });
  }
  return res.status(400).json({ message: 'Choose accept or decline.' });
};

export const updateOnDemandJobStatus = async (req, res) => {
  const id = userId(req);
  const { status } = req.body;
  const previousStatuses = { enroute: ['accepted'], ongoing: ['accepted', 'enroute'], completed: ['ongoing'] };
  if (!Object.hasOwn(previousStatuses, status)) return res.status(400).json({ message: 'Invalid service status.' });
  const job = await OnDemandJob.findOneAndUpdate(
    { _id: req.params.jobId, acceptedBy: id, status: { $in: previousStatuses[status] } },
    { $set: { status } }, { new: true },
  );
  if (!job) return res.status(409).json({ message: 'This request cannot move to that status.' });
  await notify(job.customer, 'Service request update', `Your ${job.serviceType} request is now ${status.replace('_', ' ')}.`, job, { status });
  return res.json({ job });
};

export const cancelOnDemandJob = async (req, res) => {
  const id = userId(req);
  const job = await OnDemandJob.findOneAndUpdate({ _id: req.params.jobId, customer: id, status: 'searching' }, { $set: { status: 'cancelled' } }, { new: true });
  if (!job) return res.status(409).json({ message: 'Only a request that has not been accepted can be cancelled here.' });
  await Promise.all(job.offeredTo.map((recipient) => notify(recipient, 'Service request cancelled', 'The customer cancelled this request.', job, { status: 'cancelled' })));
  res.json({ job });
};
