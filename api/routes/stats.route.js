import express from 'express';
import { getHomeStats } from '../controllers/stats.controller.js';

const router = express.Router();

router.get('/home', getHomeStats);

export default router;
