import mongoose from 'mongoose';
import { sendPushNotificationToUser } from '../utils/pushNotifications.js';

const getNotificationPreference = (notification) => {
    if (notification.type === 'booking') {
        return notification.data?.status === 'completed' && /payment|closed/i.test(notification.title || '')
            ? 'activity.paymentReceipts'
            : 'activity.bookingUpdates';
    }
    if (notification.type === 'payment') return 'activity.paymentReceipts';
    if (notification.type === 'new_post') return 'promotions.platformUpdates';
    if (notification.type === 'security') {
        return /password/i.test(notification.title || '')
            ? 'security.passwordChanges'
            : 'security.loginAttempts';
    }
    return '';
};

const getNotificationRoute = (notification) => {
    const data = notification.data || {};
    if (typeof data.route === 'string' && data.route.startsWith('/')) return data.route;
    if (typeof data.link === 'string' && data.link.startsWith('/')) return data.link;
    if (notification.type === 'message' && data.conversationId) return `/messages/${data.conversationId}`;
    if (notification.type === 'system' && data.followerId) return `/user/${data.followerId}`;
    return '/notifications';
};

const sendNotificationPush = (notification) => {
    if (!notification?.userId || !notification.message) return;
    sendPushNotificationToUser(notification.userId, {
        title: notification.title || 'LoopOut update',
        body: notification.message,
        data: {
            notificationId: notification._id,
            type: notification.type,
            route: getNotificationRoute(notification),
        },
        preference: getNotificationPreference(notification),
    }).catch((error) => {
        console.warn(`[PUSH] Could not send ${notification.type} notification:`, error.code || error.message);
    });
};

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['new_post', 'message', 'booking', 'comment', 'review', 'system', 'reference', 'payment', 'food_order', 'security']
    },
    title: {
        type: String,
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Deliver every persisted notification to registered phones. This covers both
// individual saves/creates and scheduler batch inserts in one place.
notificationSchema.post('save', sendNotificationPush);
notificationSchema.post('insertMany', (notifications) => {
    notifications.forEach(sendNotificationPush);
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
