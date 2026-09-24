import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../server';

// Mock the prisma client in the db configuration
vi.mock('../config/db', () => ({
  default: {
    wikiArticle: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../config/db';

describe('Wiki API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('GET /api/wiki/recent should return a list of recent articles', async () => {
    // Arrange: mock database return value
    const mockArticles = [
      { 
        id: 1, 
        title: 'WUS Canteen', 
        location: 'Near Arts Faculty', 
        imageUrls: [], 
        createdAt: new Date().toISOString() 
      },
    ];
    (prisma.wikiArticle.findMany as any).mockResolvedValue(mockArticles);

    // Act: make request to the endpoint
    const response = await request(app).get('/api/wiki/recent');

    // Assert: verify response and that prisma was called with correct parameters
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockArticles);
    expect(prisma.wikiArticle.findMany).toHaveBeenCalledWith({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        location: true,
        imageUrls: true,
        createdAt: true,
      }
    });
  });

  it('GET /api/wiki/recent should handle internal server errors gracefully', async () => {
    // Arrange: simulate a database failure
    (prisma.wikiArticle.findMany as any).mockRejectedValue(new Error('Database Connection Error'));

    // Act
    const response = await request(app).get('/api/wiki/recent');

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error.' });
  });
});
