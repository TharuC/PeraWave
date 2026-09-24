import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import app from '../../server';
import prisma from '../../config/db';

describe('Wiki API - Integration Test', () => {
  let testUser: { id: number };

  // Use a unique ID per run so parallel / repeated runs never clash
  const testId = randomUUID();
  const testEmail = `test_integration_${testId}@perawave.com`;
  const testRegistrationNumber = `TEST-${testId}`;

  beforeAll(async () => {
    // Create a fresh test user with unique identifiers
    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: 'dummy_hash',
        fullName: 'Integration Tester',
        registrationNumber: testRegistrationNumber,
        faculty: 'Engineering',
      },
    });
  });

  afterAll(async () => {
    // Clean up only the rows this test run created
    await prisma.wikiArticle.deleteMany({ where: { authorId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  it('should successfully write to and read from the real test database schema', async () => {
    // 1. Insert a real article into the test database
    await prisma.wikiArticle.create({
      data: {
        title: 'Integration Test Article',
        content: 'This is a test article for integration testing.',
        location: 'Test Location',
        imageUrls: [],
        authorId: testUser.id,
        status: 'APPROVED',
      },
    });

    // 2. Make a real HTTP request to the live API
    const response = await request(app).get('/api/wiki/recent');

    // 3. Verify the real data was fetched correctly
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const fetchedArticle = response.body.find(
      (article: any) => article.title === 'Integration Test Article',
    );

    expect(fetchedArticle).toBeDefined();
    expect(fetchedArticle.location).toBe('Test Location');
  });
});
