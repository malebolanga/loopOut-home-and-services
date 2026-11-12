import express from 'express';
import { getHomeStats, getServerStats, getAdminOverview, getAdminUsers, getAdminPerformance, setActivitySharing, recordUserSectionActivity, setLoginAreaSharing, recordLoginArea, updateAdminUserStatus } from '../controllers/stats.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { requireLoopOutAdmin } from '../utils/requireLoopOutAdmin.js';

const router = express.Router();

router.get('/home', getHomeStats);
router.get('/server', verifyToken, requireLoopOutAdmin, getServerStats);
router.get('/admin-overview', verifyToken, requireLoopOutAdmin, getAdminOverview);
router.get('/admin-users', verifyToken, requireLoopOutAdmin, getAdminUsers);
router.get('/admin-performance', verifyToken, requireLoopOutAdmin, getAdminPerformance);
router.put('/admin-users/:userId/status', verifyToken, requireLoopOutAdmin, updateAdminUserStatus);
router.post('/activity-sharing', verifyToken, setActivitySharing);
router.post('/section-activity', verifyToken, recordUserSectionActivity);
router.post('/login-area-sharing', verifyToken, setLoginAreaSharing);
router.post('/login-area', verifyToken, recordLoginArea);

export default router;
