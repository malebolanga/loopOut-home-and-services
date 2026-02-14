import express from 'express';
import { 
  getCarWash,
  getCarWashes
} from '../controllers/carwash.controller.js';

const router = express.Router();

// Get single car wash by ID
router.get('/get/:id', getCarWash);

// Get all car washes with filters
router.get('/get', getCarWashes);

export default router;