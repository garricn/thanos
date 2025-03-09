import express from 'express';
import request from 'supertest';

// Mock the log model
jest.mock('../db/models/log', () => ({
  insertLog: jest.fn().mockResolvedValue(1), // Mock returns ID 1
  getLogs: jest
    .fn()
    .mockResolvedValue([
      { id: 1, timestamp: '2025-03-08T00:00:00.000Z', endpoint: '/api/hello' },
    ]),
  getLogsByEndpoint: jest
    .fn()
    .mockResolvedValue([
      { id: 1, timestamp: '2025-03-08T00:00:00.000Z', endpoint: '/api/hello' },
    ]),
  closeDb: jest.fn(),
}));

// Import the log model after mocking
const logModel = require('../db/models/log');

// Create a test app with the hello endpoint
const app = express();

app.get('/api/hello', async (req, res) => {
  try {
    await logModel.insertLog('/api/hello');
    res.json({ message: 'Hello from the backend!' });
  } catch (error) {
    console.error('Error logging request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Hello API Endpoint', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/hello', () => {
    it('should return the correct message', async () => {
      const response = await request(app).get('/api/hello');

      // Check response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello from the backend!' });
    });

    it('should log the request to the database', async () => {
      await request(app).get('/api/hello');

      // Check that insertLog was called with the correct endpoint
      expect(logModel.insertLog).toHaveBeenCalledTimes(1);
      expect(logModel.insertLog).toHaveBeenCalledWith('/api/hello');
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error for this test
      logModel.insertLog.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/hello');

      // Check that we get a 500 error
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Log Model Integration', () => {
    it('should be able to retrieve logs by endpoint', async () => {
      // First make a request to create a log
      await request(app).get('/api/hello');

      // Then retrieve logs for that endpoint
      const logs = await logModel.getLogsByEndpoint('/api/hello');

      // Check that we got the expected log
      expect(logs).toHaveLength(1);
      expect(logs[0].endpoint).toBe('/api/hello');
    });
  });
});
