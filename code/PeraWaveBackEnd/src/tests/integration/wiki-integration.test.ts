import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../server';
import prisma from '../../config/db';

describe('Wiki API - Integration Test', () => {
  let testUser: any;

  beforeAll(async () => {
    // 1. Clean up existing test data
    await prisma.wikiArticle.deleteMany({
      where: { author: { email: 'test_integration@perawave.com' } }
    });
    await prisma.user.deleteMany({ where: { email: 'test_integration@perawave.com' } });

    // 2. Create a test user
    testUser = await prisma.user.create({
      data: {
        email: 'test_integration@perawave.com',
        password: 'dummy_hash',
        fullName: 'Integration Tester',
        registrationNumber: 'E/20/001',
        faculty: 'Engineering',
      }
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.wikiArticle.deleteMany({
      where: { author: { email: 'test_integration@perawave.com' } }
    });
    await prisma.user.deleteMany({ where: { email: 'test_integration@perawave.com' } });
    await prisma.$disconnect();
  });

  it('should successfully write to and read from the real test database schema', async () => {
    // 1. Manually insert a test article into the REAL test database
    await prisma.wikiArticle.create({
      data: {
        title: 'Integration Test Article',
        content: 'This is a test article for integration testing.',
        location: 'Test Location',
        imageUrls: [],
        authorId: testUser.id,
        status: 'APPROVED',
      }
    });

    // 2. Make an actual API request to fetch it
    const response = await request(app).get('/api/wiki/recent');
    
    // 3. Verify it fetched the real data from the test DB
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    
    const fetchedArticle = response.body.find((a: any) => a.title === 'Integration Test Article');
    expect(fetchedArticle).toBeDefined();
    expect(fetchedArticle.location).toBe('Test Location');
  });
});
