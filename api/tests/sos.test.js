import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index.js';
import User from '../models/user.model.js';
import SOSAlert from '../models/sosAlert.model.js';
import Notification from '../models/notification.model.js';
import { notifyLoopOutAdmins } from '../utils/notifyLoopOutAdmins.js';
import { connectTestDatabase, disconnectTestDatabase } from './testDatabase.js';

describe('Provider panic alert API', () => {
  let provider;
  let anotherProvider;
  let adminUsers;
  let providerToken;
  let anotherProviderToken;

  beforeAll(async () => {
    await connectTestDatabase();
    provider = await User.create({
      username: 'sos-provider',
      email: 'sos-provider@example.com',
      password: 'test-password-hash',
      isVerified: true,
      offeringType: 'services',
      contacts: [{ name: 'Trusted person', phone: '+27123456789' }],
    });
    anotherProvider = await User.create({
      username: 'sos-provider-two',
      email: 'sos-provider-two@example.com',
      password: 'test-password-hash',
      isVerified: true,
      offeringType: 'services',
    });
    adminUsers = await User.create([
      { username: 'loopout-admin-one', email: 'malebolanga3@gmail.com', password: 'test-password-hash' },
      { username: 'loopout-admin-two', email: 'admin@loopout.co.za', password: 'test-password-hash' },
    ]);
    providerToken = jwt.sign({ id: provider._id }, process.env.JWT_SECRET);
    anotherProviderToken = jwt.sign({ id: anotherProvider._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await SOSAlert.deleteMany({ user: { $in: [provider?._id, anotherProvider?._id] } });
    await Notification.deleteMany({ userId: { $in: adminUsers?.map(({ _id }) => _id) || [] } });
    await User.deleteMany({ _id: { $in: [provider?._id, anotherProvider?._id, ...(adminUsers || []).map(({ _id }) => _id)] } });
    await disconnectTestDatabase();
  });

  it('requires an authenticated provider and valid GPS coordinates', async () => {
    const unauthorized = await request(app).post('/api/sos/trigger').send({ latitude: -25, longitude: 28 });
    expect(unauthorized.statusCode).toBe(401);

    const invalidPosition = await request(app)
      .post('/api/sos/trigger')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ latitude: 100, longitude: 28 });
    expect(invalidPosition.statusCode).toBe(400);
  });

  it('records a code and map pin, returns saved contacts, and lets only the owner close it', async () => {
    const created = await request(app)
      .post('/api/sos/trigger')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ latitude: -25.7479, longitude: 28.2293 });

    expect(created.statusCode).toBe(201);
    expect(created.body.alert.code).toMatch(/^LOOP-SOS-[A-F0-9]{8}$/);
    expect(created.body.mapUrl).toBe('https://maps.google.com/?q=-25.7479,28.2293');
    expect(created.body.contacts).toEqual([{ name: 'Trusted person', phone: '+27123456789' }]);
    expect(created.body.message).toContain('have not been texted yet');

    const adminAlerts = await Notification.find({ userId: { $in: adminUsers.map(({ _id }) => _id) }, 'data.adminAlertType': 'panic_alert' });
    expect(adminAlerts).toHaveLength(2);
    expect(adminAlerts.every(({ data }) => data.route === '/admin/verification' && data.alertCode === created.body.alert.code)).toBe(true);

    const forbiddenClose = await request(app)
      .post(`/api/sos/${created.body.alert.id}/close`)
      .set('Authorization', `Bearer ${anotherProviderToken}`);
    expect(forbiddenClose.statusCode).toBe(404);

    const closed = await request(app)
      .post(`/api/sos/${created.body.alert.id}/close`)
      .set('Authorization', `Bearer ${providerToken}`);
    expect(closed.statusCode).toBe(200);
    expect(closed.body.alert.status).toBe('closed');
  });

  it('sends identity-review bell notifications to both configured admins', async () => {
    await notifyLoopOutAdmins({
      title: 'Identity verification needs review',
      message: 'A user submitted identity documents for manual review.',
      data: { adminAlertType: 'identity_pending', targetUserId: 'test-user-id' },
    });

    const reviewAlerts = await Notification.find({ userId: { $in: adminUsers.map(({ _id }) => _id) }, 'data.adminAlertType': 'identity_pending' });
    expect(reviewAlerts).toHaveLength(2);
    expect(reviewAlerts.every(({ data }) => data.route === '/admin/verification')).toBe(true);
  });

  it('rejects non-service accounts even with a valid session and GPS pin', async () => {
    const viewer = await User.create({
      username: 'sos-viewer',
      email: 'sos-viewer@example.com',
      password: 'test-password-hash',
      isVerified: true,
      offeringType: 'viewer',
    });
    const viewerToken = jwt.sign({ id: viewer._id }, process.env.JWT_SECRET);
    const response = await request(app)
      .post('/api/sos/trigger')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ latitude: -25, longitude: 28 });
    expect(response.statusCode).toBe(403);
    await User.deleteOne({ _id: viewer._id });
  });
});
