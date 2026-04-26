import express from 'express';
import { triggerSOS } from '../controllers/sos.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/trigger', verifyToken, triggerSOS);

export default router;
