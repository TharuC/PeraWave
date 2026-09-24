import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../server';

describe('Server Health Check', () => {
  it('should return 200 and a success message from /api/health', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'PeraWave Backend is running!' });
  });
});
