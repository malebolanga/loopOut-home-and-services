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
import { requireProviderAccount } from '../utils/requireOfferingType.js';

const router = express.Router();

router.post('/create', verifyToken, requireProviderAccount, createEvent);
router.get('/get', getEvents);
router.get('/:id', getEvent);
router.put('/:id', verifyToken, requireProviderAccount, updateEvent);
router.delete('/:id', verifyToken, requireProviderAccount, deleteEvent);
router.get('/similar/:id', getSimilarEvents);

export default router;
