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

const router = express.Router();

router.post('/create', verifyToken, createEvent);
router.get('/get', getEvents);
router.get('/:id', getEvent);
router.put('/:id', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);
router.get('/similar/:id', getSimilarEvents);

export default router;