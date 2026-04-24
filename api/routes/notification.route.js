import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../utils/verifyUser.js';
import Notification from '../models/notification.model.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', verifyToken, async(req, res) => {
    try {
        console.log('[NOTIF] Fetching for user:', req.user?.id);
        
        if (!req.user || !req.user.id) {
            console.error('[NOTIF] Error: req.user.id is missing');
            return res.status(401).json({ success: false, message: 'Unauthorized: No user ID in token' });
        }

        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            console.error('[NOTIF] Error: Database not connected. State:', mongoose.connection.readyState);
            return res.status(503).json({ success: false, message: 'Database connecting, please retry' });
        }

        const userId = req.user.id;

        // Use Promise.all to fetch both in parallel
        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
            Notification.countDocuments({ userId, read: false })
        ]);

        console.log(`[NOTIF] Found ${notifications.length} notifications (${unreadCount} unread)`);

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('[NOTIF] CRITICAL SERVER ERROR:', error);
        res.status(500).json({ 
            success: false,
            message: 'Notification service error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Mark notifications as read
router.post('/read', verifyToken, async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { notificationId } = req.body;
        const userId = req.user.id;

        if (notificationId) {
            await Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true });
        } else {
            await Notification.updateMany({ userId, read: false }, { read: true });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[NOTIF] Mark Read Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update notifications',
            error: error.message 
        });
    }
});

export default router;