import express from 'express';
import { 
  createTrip, 
  getTrip, 
  searchForStop,
  getUserTrips
} from '../controllers/trip.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createTrip);
router.get('/search', searchForStop);
router.get('/user/:userId', verifyToken, getUserTrips);
router.get('/:id', getTrip);

export default router;