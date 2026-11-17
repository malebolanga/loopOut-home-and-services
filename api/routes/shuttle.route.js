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

const router = express.Router();

// Public routes
router.get('/get', getShuttles);
router.get('/get/:id', getShuttleById);

// Driver / Protected routes
router.post('/create', verifyToken, createShuttle);
router.post('/add-route/:id', verifyToken, addRouteToShuttle);
router.get('/my-shuttles', verifyToken, getMyDriverShuttles);
router.put('/update-location/:id', verifyToken, updateShuttleLocation);
router.put('/update/:id', verifyToken, updateShuttle);
router.delete('/delete/:id', verifyToken, deleteShuttle);

export default router;
