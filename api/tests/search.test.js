import request from 'supertest';
import app from '../index.js';
import Shop from '../models/shop.model.js';
import { connectTestDatabase, disconnectTestDatabase } from './testDatabase.js';

describe('Search API', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('caps requested page size and returns food results page by page', async () => {
    const shop = await Shop.create({
      name: `Search test ${Date.now()}`,
      ownerId: 'search-test-owner',
      meals: Array.from({ length: 13 }, (_, index) => ({
        id: `meal-${index}`,
        name: `Search test meal ${index}`,
        price: 25 + index,
      })),
    });

    const firstPage = await request(app).get('/api/search?type=food&limit=100');
    expect(firstPage.statusCode).toBe(200);
    expect(firstPage.body.limit).toBe(20);
    expect(firstPage.body.items).toHaveLength(13);

    const limitedFirstPage = await request(app).get('/api/search?type=food&page=0&limit=12&q=Search%20test');
    const secondPage = await request(app).get('/api/search?type=food&page=1&limit=12&q=Search%20test');

    expect(limitedFirstPage.statusCode).toBe(200);
    expect(limitedFirstPage.body.items).toHaveLength(12);
    expect(limitedFirstPage.body.hasMore).toBe(true);
    expect(secondPage.statusCode).toBe(200);
    expect(secondPage.body.items).toHaveLength(1);
    expect(secondPage.body.hasMore).toBe(false);
  });

  it('rejects invalid pagination and unsupported search types', async () => {
    const invalidPage = await request(app).get('/api/search?page=-1');
    const invalidType = await request(app).get('/api/search?type=unknown');

    expect(invalidPage.statusCode).toBe(400);
    expect(invalidType.statusCode).toBe(400);
  });
});
