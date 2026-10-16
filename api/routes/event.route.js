import express from 'express';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getSimilarEvents,
} from '../controllers/event.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { requireOfferingType } from '../utils/requireOfferingType.js';

const router = express.Router();

router.post('/create', verifyToken, requireOfferingType('property', 'goods'), createEvent);
router.get('/get', getEvents);
router.get('/:id', getEvent);
router.put('/:id', verifyToken, requireOfferingType('property', 'goods'), updateEvent);
router.delete('/:id', verifyToken, requireOfferingType('property', 'goods'), deleteEvent);
router.get('/similar/:id', getSimilarEvents);

export default router;
