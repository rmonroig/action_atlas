import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server';

describe('Backend API Sanity Test', () => {
    it('should have a working environment', () => {
        expect(true).toBe(true);
    });

    it('GET /api/history should return 401 if not logged in', async () => {
        const response = await request(app).get('/api/history');
        expect(response.status).toBe(401);
    });
});
