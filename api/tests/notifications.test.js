import request from 'supertest';
import app from '../index.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

describe('Notifications API', () => {
  let token;
  let userId;
  let mockNotification;

  beforeAll(async () => {
    // Generate a temporary user and token
    userId = new mongoose.Types.ObjectId().toString();
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret');

    // Create a mock notification in the DB
    mockNotification = await Notification.create({
      userId,
      title: 'Test Notification',
      message: 'This is a test notification message.',
      type: 'booking',
      read: false
    });
  });

  afterAll(async () => {
    // Clean up mock notifications created by the tests
    if (userId) {
      await Notification.deleteMany({ userId });
    }
    await mongoose.disconnect();
  });

  it('should get user notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.notifications).toBeDefined();
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it('should mark a specific notification as read using PUT /:id/read', async () => {
    const res = await request(app)
      .put(`/api/notifications/${mockNotification._id}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    // Verify in database
    const updated = await Notification.findById(mockNotification._id);
    expect(updated.read).toBe(true);
  });

  it('should mark all notifications as read using PUT /read-all', async () => {
    // Create another unread notification
    const anotherNotif = await Notification.create({
      userId,
      title: 'Another Notif',
      message: 'Hello',
      type: 'system',
      read: false
    });

    const res = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    // Verify in database
    const count = await Notification.countDocuments({ userId, read: false });
    expect(count).toBe(0);
  });

  it('should delete a notification using DELETE /:id', async () => {
    const res = await request(app)
      .delete(`/api/notifications/${mockNotification._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const deleted = await Notification.findById(mockNotification._id);
    expect(deleted).toBeNull();
  });
});
