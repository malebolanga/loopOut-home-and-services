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
router.delete('/:id', verifyToken, deleteEvent);
// Aliases used by the web client (same URL style as /api/listing/update/:id and /delete/:id).
router.put('/update/:id', verifyToken, requireOfferingType('property', 'goods'), updateEvent);
router.delete('/delete/:id', verifyToken, deleteEvent);
router.get('/similar/:id', getSimilarEvents);

export default router;
