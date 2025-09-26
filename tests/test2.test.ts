// math.test.js
import app from '../src/app';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
describe('add function', () => {
    it('should return the sum of two numbers', () => {
        expect(2 + 3).toBe(5);
    });
    it("Get all The data", async () => {
        const response = await request(app)
            .get('/users/999')
    })
});

// Run with: npx vitest