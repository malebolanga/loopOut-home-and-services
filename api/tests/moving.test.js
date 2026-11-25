import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index.js';
import User from '../models/user.model.js';
import MovingVehicle from '../models/movingVehicle.model.js';
import MovingRequest from '../models/movingRequest.model.js';
import Notification from '../models/notification.model.js';
import { connectTestDatabase, disconnectTestDatabase } from './testDatabase.js';

describe('Moving service end-to-end lifecycle API', () => {
  let driver;
  let customer;
  let admin;
  let driverToken;
  let customerToken;
  let adminToken;
  let vehicleId;
  let requestId;

  beforeAll(async () => {
    await connectTestDatabase();
    driver = await User.create({
      username: 'moving-driver-e2e',
      name: 'Moving Driver',
      email: 'moving-driver-e2e@example.com',
      password: 'test-password-hash',
      isVerified: true,
      offeringType: 'shuttle',
      phone: '+27820001111',
      driverVerification: {
        status: 'verified',
        idDocumentUrl: 'https://firebasestorage.googleapis.com/v0/b/central-cinema-218106.firebasestorage.app/o/id.jpg?alt=media',
        facePhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/central-cinema-218106.firebasestorage.app/o/face.jpg?alt=media',
        licenceDocumentUrl: 'https://firebasestorage.googleapis.com/v0/b/central-cinema-218106.firebasestorage.app/o/licence.jpg?alt=media',
      },
    });
    customer = await User.create({
      username: 'moving-customer-e2e',
      name: 'Moving Customer',
      email: 'moving-customer-e2e@example.com',
      password: 'test-password-hash',
      isVerified: true,
      phone: '+27820002222',
    });
    admin = await User.create({
      username: 'moving-admin-e2e',
      email: 'malebolanga3@gmail.com',
      password: 'test-password-hash',
      isVerified: true,
      isAdmin: true,
    });
    driverToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET);
    customerToken = jwt.sign({ id: customer._id }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await MovingRequest.deleteMany({ _id: requestId });
    await MovingVehicle.deleteMany({ _id: vehicleId });
    await Notification.deleteMany({ userId: { $in: [driver?._id, customer?._id, admin?._id].filter(Boolean) } });
    await User.deleteMany({ _id: { $in: [driver?._id, customer?._id, admin?._id].filter(Boolean) } });
    await disconnectTestDatabase();
  });

  it('completes upload -> admin approval -> map -> booking -> completion -> close/repost', async () => {
    const uploadRes = await request(app)
      .post('/api/shuttles/moving/vehicles')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        vehicleType: 'mini_truck',
        vehicleDescription: 'Hyundai H100 1.3 Ton',
        carColor: 'White',
        plateNumber: 'E2E100L',
        vehicleImageUrl: 'https://firebasestorage.googleapis.com/v0/b/central-cinema-218106.firebasestorage.app/o/truck.jpg?alt=media',
        driverPhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/central-cinema-218106.firebasestorage.app/o/driver.jpg?alt=media',
        vehicleLicenceDocumentUrl: 'https://firebasestorage.googleapis.com/v0/b/central-cinema-218106.firebasestorage.app/o/disc.pdf?alt=media',
        hourlyRate: 350,
        callOutFee: 100,
        driverPhone: '+27820001111',
        currentCoordinates: { lat: -23.8962, lng: 29.4486, accuracy: 25, address: 'Polokwane CBD', locationSource: 'gps' },
      });
    expect(uploadRes.statusCode).toBe(201);
    vehicleId = uploadRes.body.vehicle._id;

    // Not visible on public map until admin approves
    const beforeApproval = await request(app).get('/api/shuttles/moving/nearby?lat=-23.8962&lng=29.4486');
    expect(beforeApproval.statusCode).toBe(200);
    expect(beforeApproval.body.vehicles.some((v) => v._id === vehicleId)).toBe(false);

    // Admin approves vehicle
    const approveRes = await request(app)
      .post(`/api/shuttles/moving/admin/${vehicleId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'approved',
        checks: {
          plateMatchesDocument: true,
          driverMatchesApprovedAccount: true,
          vehicleDetailsMatch: true,
          vehiclePhotoMatchesDetails: true,
        },
      });
    expect(approveRes.statusCode).toBe(200);

    // Now visible on nearby map
    const afterApproval = await request(app).get('/api/shuttles/moving/nearby?lat=-23.8962&lng=29.4486');
    expect(afterApproval.statusCode).toBe(200);
    expect(afterApproval.body.vehicles.some((v) => v._id === vehicleId)).toBe(true);

    // Customer books moving request
    const reqRes = await request(app)
      .post('/api/shuttles/moving/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        vehicleId,
        requesterName: 'Moving Customer',
        requesterPhone: '+27820002222',
        pickupAddress: 'Market St, Polokwane',
        dropoffAddress: 'Bendor, Polokwane',
        pickupCoordinates: { lat: -23.898, lng: 29.45 },
        requestedAt: new Date(Date.now() + 3600_000).toISOString(),
        itemDescription: 'Fridge and sofa',
      });
    expect(reqRes.statusCode).toBe(201);
    requestId = reqRes.body.request._id;

    // Driver accepts -> proposes quote -> customer accepts -> driver starts -> completes -> payment
    expect((await request(app).patch(`/api/shuttles/moving/requests/${requestId}`).set('Authorization', `Bearer ${driverToken}`).send({ status: 'accepted' })).statusCode).toBe(200);
    expect((await request(app).patch(`/api/shuttles/moving/requests/${requestId}`).set('Authorization', `Bearer ${driverToken}`).send({ status: 'quote_proposed', quoteAmount: 450 })).statusCode).toBe(200);
    expect((await request(app).patch(`/api/shuttles/moving/requests/${requestId}`).set('Authorization', `Bearer ${customerToken}`).send({ status: 'quote_accepted' })).statusCode).toBe(200);
    expect((await request(app).patch(`/api/shuttles/moving/requests/${requestId}`).set('Authorization', `Bearer ${driverToken}`).send({ status: 'in_progress' })).statusCode).toBe(200);
    expect((await request(app).patch(`/api/shuttles/moving/requests/${requestId}`).set('Authorization', `Bearer ${driverToken}`).send({ status: 'service_completed' })).statusCode).toBe(200);
    expect((await request(app).patch(`/api/shuttles/moving/requests/${requestId}`).set('Authorization', `Bearer ${customerToken}`).send({ status: 'payment_reported', paymentMethod: 'cash' })).statusCode).toBe(200);
    expect((await request(app).patch(`/api/shuttles/moving/requests/${requestId}`).set('Authorization', `Bearer ${driverToken}`).send({ status: 'paid' })).statusCode).toBe(200);

    // Close and repost without resending coordinates (uses saved fallback)
    expect((await request(app).post(`/api/shuttles/moving/vehicles/${vehicleId}/close`).set('Authorization', `Bearer ${driverToken}`)).statusCode).toBe(200);
    expect((await request(app).post(`/api/shuttles/moving/vehicles/${vehicleId}/repost`).set('Authorization', `Bearer ${driverToken}`).send({})).statusCode).toBe(200);
  });
});
