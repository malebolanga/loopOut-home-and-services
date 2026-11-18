import express from 'express';
import {
  createShuttle,
  addRouteToShuttle,
  getShuttles,
  getShuttleById,
  updateShuttleLocation,
  updateShuttle,
  deleteShuttle,
  getMyDriverShuttles,
} from '../controllers/shuttle.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import {
  getNearbyMovingVehicles,
  createMovingVehicle,
  createMovingRequest,
  getMyMovingRequests,
  updateMovingRequest,
  updateMovingVehicleLocation,
  getMyMovingVehicles,
  getPendingMovingVehicleReviews,
  reviewMovingVehicle,
  reportMovingIssue,
  rateMovingService,
  getPendingMovingIssues,
  resolveMovingIssue,
} from '../controllers/moving.controller.js';
import { requireLoopOutAdmin } from '../utils/requireLoopOutAdmin.js';

const router = express.Router();

// Public routes
router.get('/get', getShuttles);
router.get('/get/:id', getShuttleById);
router.get('/moving/nearby', getNearbyMovingVehicles);
router.get('/moving/admin/pending', verifyToken, requireLoopOutAdmin, getPendingMovingVehicleReviews);
router.post('/moving/admin/:vehicleId/review', verifyToken, requireLoopOutAdmin, reviewMovingVehicle);
router.get('/moving/admin/issues', verifyToken, requireLoopOutAdmin, getPendingMovingIssues);
router.patch('/moving/admin/issues/:id', verifyToken, requireLoopOutAdmin, resolveMovingIssue);

// Driver / Protected routes
router.post('/create', verifyToken, createShuttle);
router.post('/add-route/:id', verifyToken, addRouteToShuttle);
router.get('/my-shuttles', verifyToken, getMyDriverShuttles);
router.put('/update-location/:id', verifyToken, updateShuttleLocation);
router.put('/update/:id', verifyToken, updateShuttle);
router.delete('/delete/:id', verifyToken, deleteShuttle);
router.post('/moving/vehicles', verifyToken, createMovingVehicle);
router.put('/moving/vehicles/:id/location', verifyToken, updateMovingVehicleLocation);
router.get('/moving/vehicles/mine', verifyToken, getMyMovingVehicles);
router.post('/moving/requests', verifyToken, createMovingRequest);
router.get('/moving/requests/mine', verifyToken, getMyMovingRequests);
router.patch('/moving/requests/:id', verifyToken, updateMovingRequest);
router.post('/moving/requests/:id/issues', verifyToken, reportMovingIssue);
router.post('/moving/requests/:id/rating', verifyToken, rateMovingService);

export default router;
