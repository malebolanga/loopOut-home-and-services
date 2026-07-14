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

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('[NOTIF] Error: req.user.id is not a valid ObjectId:', userId);
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

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

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        if (notificationId && !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ success: false, message: 'Invalid notification ID format' });
        }

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

// Mark all notifications as read (RESTful PUT /read-all)
router.put('/read-all', verifyToken, async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }
        await Notification.updateMany({ userId, read: false }, { read: true });

        res.json({ success: true });
    } catch (error) {
        console.error('[NOTIF] Mark All Read Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message 
        });
    }
});

// Mark a single notification as read (RESTful PUT /:id/read)
router.put('/:id/read', verifyToken, async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userId = req.user.id;
        const notificationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('[NOTIF] Mark Single Read Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message 
        });
    }
});

// Clear all notifications (RESTful DELETE /clear-all)
router.delete('/clear-all', verifyToken, async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }
        await Notification.deleteMany({ userId });

        res.json({ success: true, message: 'All notifications cleared successfully' });
    } catch (error) {
        console.error('[NOTIF] Clear All Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to clear notifications',
            error: error.message 
        });
    }
});

// Delete a notification (RESTful DELETE /:id)
router.delete('/:id', verifyToken, async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userId = req.user.id;
        const notificationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('[NOTIF] Delete Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to delete notification',
            error: error.message 
        });
    }
});

export default router;