import request from 'supertest';
import app from '../index.js';
import mongoose from 'mongoose';

describe('Auth API', () => {
  // Disconnect from DB after tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return 404 for non-existent user signin', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('User not found!');
  });

  const testUser = {
    username: 'testuser_' + Math.random().toString(36).slice(2, 7),
    email: 'test_' + Math.random().toString(36).slice(2, 7) + '@example.com',
    password: 'password123'
  };

  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should resume registration with 201 if email exists but is unverified', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toContain('updated');
  });

  it('should not sign up with an existing email if already verified', async () => {
    // Manually mark the user as verified in DB for this test
    await mongoose.model('User').updateOne({ email: testUser.email }, { isVerified: true });

    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toContain('already verified');
  });

  it('should sign in successfully', async () => {
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
