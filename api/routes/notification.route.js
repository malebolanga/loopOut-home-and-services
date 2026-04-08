import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import Notification from '../models/notification.model.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', verifyToken, async(req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            read: false
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('SERVER ERROR STACK (Notifications):', error.stack || error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
});

// Mark notifications as read
router.post('/read', verifyToken, async(req, res) => {
    try {
        const { notificationId } = req.body;

        if (notificationId) {
            // Mark single notification as read
            await Notification.findOneAndUpdate({ _id: notificationId, userId: req.user.id }, { read: true });
        } else {
            // Mark all notifications as read
            await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('SERVER ERROR STACK (MarkRead):', error.stack || error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
});

export default router;