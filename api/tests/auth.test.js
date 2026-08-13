import request from 'supertest';
import app from '../index.js';
import mongoose from 'mongoose';

describe('Auth API', () => {
  // Disconnect from DB after tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return 401 for non-existent user signin', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
    
    // Controller returns 401 (invalid email or password) for non-existent users
    // to prevent user enumeration attacks
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  const testUser = {
    username: 'testuser_' + Math.random().toString(36).slice(2, 7),
    email: 'test_' + Math.random().toString(36).slice(2, 7) + '@example.com',
    password: 'TestPassword123!',
    phone: '+27123456789',
    location: 'Cape Town, South Africa',
    acceptedTerms: true,
  };

  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.email).toBe(testUser.email);
  });

  it('should resend verification for unverified existing email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    // Returns 200 (not 201) when re-sending code to an existing unverified account
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresVerification).toBe(true);
  });

  it('should return 409 when email is already verified', async () => {
    // Manually mark the user as verified in DB for this test
    await mongoose.model('User').updateOne({ email: testUser.email }, { isVerified: true });

    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toContain('already exists');
  });

  it('should sign in successfully after verification', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

