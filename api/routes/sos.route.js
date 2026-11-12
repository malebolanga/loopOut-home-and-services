import express from 'express';
import { triggerSOS, closeSOSAlert } from '../controllers/sos.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/trigger', verifyToken, triggerSOS);
router.post('/:alertId/close', verifyToken, closeSOSAlert);

export default router;
