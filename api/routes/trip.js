import express from 'express';
import { 
  createTrip, 
  getTrip, 
  searchForStop 
} from '../controllers/trip.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createTrip);
router.get('/search', searchForStop);  // Fixed route order - must come before :id
router.get('/:id', getTrip);

export default router;