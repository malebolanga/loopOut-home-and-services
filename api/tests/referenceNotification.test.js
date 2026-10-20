import request from 'supertest';
import app from '../index.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import Conversation from '../models/Conversation.model.js';
import Message from '../models/Message.model.js';
import { connectTestDatabase, disconnectTestDatabase } from './testDatabase.js';

describe('Ask For Reference Notification Flow', () => {
  let senderToken;
  let senderUser;
  let receiverToken;
  let receiverUser;

  beforeAll(async () => {
    await connectTestDatabase();

    // Create sender user
    senderUser = await User.create({
      username: 'RequesterUser',
      email: 'requester@test.com',
      password: 'hashedpassword123',
      isVerified: true
    });
    senderToken = jwt.sign({ id: senderUser._id.toString() }, process.env.JWT_SECRET || 'secret');

    // Create receiver user (past client being asked for a reference)
    receiverUser = await User.create({
      username: 'PastClientUser',
      email: 'pastclient@test.com',
      password: 'hashedpassword123',
      isVerified: true
    });
    receiverToken = jwt.sign({ id: receiverUser._id.toString() }, process.env.JWT_SECRET || 'secret');
  });

  afterAll(async () => {
    if (senderUser) {
      await User.findByIdAndDelete(senderUser._id);
    }
    if (receiverUser) {
      await User.findByIdAndDelete(receiverUser._id);
      await Notification.deleteMany({ userId: receiverUser._id });
    }
    await Conversation.deleteMany({ participants: { $in: [senderUser?._id, receiverUser?._id] } });
    await disconnectTestDatabase();
  });

  it('should send a reference message and create a reference notification with bell count increment', async () => {
    // Requester asks for reference regarding a booked service provider
    const sendRes = await request(app)
      .post('/api/messages/send')
      .set('Cookie', [`access_token=${senderToken}`])
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiverId: receiverUser._id.toString(),
        content: `Hi PastClientUser, I noticed that you've booked Chef Gordon before. Would you recommend them? Thanks!`,
        isReference: true,
        referenceDetails: {
          providerName: 'Chef Gordon',
          providerType: 'chef',
          bookerName: 'PastClientUser'
        }
      });

    expect(sendRes.statusCode).toEqual(201);
    expect(sendRes.body.conversationId).toBeDefined();

    // Receiver checks notifications (bell icon fetch)
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Cookie', [`access_token=${receiverToken}`])
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(notifRes.statusCode).toEqual(200);
    expect(notifRes.body.unreadCount).toBeGreaterThanOrEqual(1);

    const refNotif = notifRes.body.notifications.find(n => n.type === 'reference');
    expect(refNotif).toBeDefined();
    expect(refNotif.title).toContain('Reference Request from RequesterUser');
    expect(refNotif.message).toContain('Chef Gordon');
    expect(refNotif.data.isReference).toBe(true);
    expect(refNotif.data.providerName).toBe('Chef Gordon');
    expect(refNotif.read).toBe(false);

    // When receiver opens the conversation, notifications for that conversation should be marked read
    const messagesRes = await request(app)
      .get(`/api/messages/${sendRes.body.conversationId}`)
      .set('Cookie', [`access_token=${receiverToken}`])
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(messagesRes.statusCode).toEqual(200);

    // Verify notification is now read
    const updatedNotif = await Notification.findById(refNotif._id);
    expect(updatedNotif.read).toBe(true);
  });
});
