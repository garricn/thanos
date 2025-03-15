import request from 'supertest';
import { createTestApp } from '../test-utils';

// Mock the log model
jest.mock(
  '../../../db/models/log',
  () => ({
    insertLog: jest.fn().mockResolvedValue(1),
    closeDb: jest.fn(),
  }),
  { virtual: true }
);

// Mock console.log to prevent noise in test output
jest.spyOn(console, 'log').mockImplementation(() => {
  /* empty function to suppress console output */
});

// Create the test app
const app = createTestApp();

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return a message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello API' });
    });
  });

  describe('GET /api/health', () => {
    it('should return status ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
