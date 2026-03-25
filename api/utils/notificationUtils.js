import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

/**
 * Creates notifications for all users whose location matches the neighborhood of a new post.
 * @param {Object} item - The created item (listing, helper, event, service)
 * @param {String} itemType - The type of the item ('listing', 'helper', 'event', 'service')
 */
export const createAreaNotifications = async (item, itemType) => {
    try {
        // Extract location - using 'near' as primary, fallback to 'address'
        let location = item.near || '';

        // If 'near' is empty but address exists, try to use the last part of address as neighborhood
        if (!location && item.address) {
            const parts = item.address.split(',');
            location = parts[parts.length - 1].trim();
        }

        if (!location) return;

        // Find all users who are in this location
        // We use a case-insensitive regex for flexibility
        const usersInArea = await User.find({
            location: { $regex: new RegExp(location.trim(), 'i') },
            _id: { $ne: item.userRef || item.creator } // Don't notify the creator
        });

        if (usersInArea.length === 0) return;

        const notificationType = 'new_post';
        const postTitle = item.name || item.title || 'New Post';

        // Create notifications for each user
        const notificationPromises = usersInArea.map(user => {
            const notification = new Notification({
                userId: user._id,
                type: notificationType,
                title: `New ${itemType} in ${location}`,
                message: `A new ${itemType} "${postTitle}" has been posted in your area!`,
                data: {
                    itemId: item._id,
                    itemType: itemType,
                    location: location
                }
            });
            return notification.save();
        });

        await Promise.all(notificationPromises);
        console.log(`Created ${usersInArea.length} area notifications for new ${itemType} in ${location}`);
    } catch (error) {
        console.error('Error creating area notifications:', error);
    }
};

/**
 * Creates a notification for a specific user when someone interacts with their content.
 * @param {String} userId - The recipient of the notification
 * @param {String} type - The type of notification
 * @param {String} title - The notification title
 * @param {String} message - The notification message
 * @param {Object} data - Additional data (itemId, itemType, etc.)
 */
export const createUserNotification = async (userId, type, title, message, data = {}) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            data
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating user notification:', error);
    }
};
