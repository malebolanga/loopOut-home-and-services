import express from 'express';
import { getHomeStats, getServerStats } from '../controllers/stats.controller.js';

const router = express.Router();

router.get('/home', getHomeStats);
router.get('/server', getServerStats);

export default router;
