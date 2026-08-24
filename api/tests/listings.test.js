import request from 'supertest';
import app from '../index.js';
import { connectTestDatabase, disconnectTestDatabase } from './testDatabase.js';

describe('Listings API', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('should get listings with default parameters', async () => {
    const res = await request(app).get('/api/listing/get');
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should filter listings by search term', async () => {
    const res = await request(app).get('/api/listing/get?searchTerm=test');
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
