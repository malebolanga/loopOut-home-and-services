import express from 'express';
import { 
  searchTripOptions, 
  saveTrip 
} from '../controllers/trip.controller.js';

const router = express.Router();

// Trip routes
router.get('/trips/search', searchTripOptions);
router.post('/trips', saveTrip);

export default router;