import request from 'supertest';
import app from '../index.js';
import { connectTestDatabase, disconnectTestDatabase } from './testDatabase.js';

describe('Auth API', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
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
    const { default: mongoose } = await import('mongoose');
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

  it('should enable, require, and disable two-factor sign-in using email codes', async () => {
    const crypto = await import('crypto');
    const { default: User } = await import('../models/user.model.js');
    const user = await User.findOne({ email: testUser.email });
    user.twoFactorEnabled = true;
    await user.save();

    const challenge = await request(app)
      .post('/api/auth/signin')
      .send({ email: testUser.email, password: testUser.password });
    expect(challenge.statusCode).toBe(200);
    expect(challenge.body.requiresTwoFactor).toBe(true);
    expect(challenge.body.token).toBeUndefined();

    const loginCode = '381642';
    await User.updateOne({ _id: user._id }, {
      otp: crypto.createHash('sha256').update(loginCode).digest('hex'),
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 0,
      otpPurpose: 'two-factor-login',
    });
    const verified = await request(app)
      .post('/api/auth/verify-two-factor-login')
      .send({ email: testUser.email, otp: loginCode });
    expect(verified.statusCode).toBe(200);
    expect(verified.body.token).toBeTruthy();
    expect(verified.body.twoFactorEnabled).toBe(true);
    expect(verified.body.otp).toBeUndefined();

    const authorization = `Bearer ${verified.body.token}`;
    const disableChallenge = await request(app)
      .post('/api/auth/two-factor/disable')
      .set('Authorization', authorization)
      .send({});
    expect(disableChallenge.statusCode).toBe(200);
    expect(disableChallenge.body.requiresCode).toBe(true);

    const disableCode = '529713';
    await User.updateOne({ _id: user._id }, {
      otp: crypto.createHash('sha256').update(disableCode).digest('hex'),
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 0,
      otpPurpose: 'two-factor-disable',
    });
    const disabled = await request(app)
      .post('/api/auth/two-factor/disable/confirm')
      .set('Authorization', authorization)
      .send({ otp: disableCode });
    expect(disabled.statusCode).toBe(200);
    expect(disabled.body.user.twoFactorEnabled).toBe(false);

    const setupChallenge = await request(app)
      .post('/api/auth/two-factor/enable')
      .set('Authorization', authorization)
      .send({});
    expect(setupChallenge.statusCode).toBe(200);
    expect(setupChallenge.body.requiresCode).toBe(true);

    const setupCode = '764205';
    await User.updateOne({ _id: user._id }, {
      otp: crypto.createHash('sha256').update(setupCode).digest('hex'),
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 0,
      otpPurpose: 'two-factor-setup',
    });
    const enabled = await request(app)
      .post('/api/auth/two-factor/confirm')
      .set('Authorization', authorization)
      .send({ otp: setupCode });
    expect(enabled.statusCode).toBe(200);
    expect(enabled.body.user.twoFactorEnabled).toBe(true);
  });
});
