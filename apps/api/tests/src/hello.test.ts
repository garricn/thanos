import request from 'supertest';
import { createTestApp, mockLogModel } from '../test-utils';

// Mock console.error to prevent noise in test output
let consoleErrorSpy: jest.SpyInstance;

// Create the test app
const app = createTestApp();

describe('Hello API Endpoint', () => {
  beforeEach(() => {
    // Mock console.error before each test
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* empty function to suppress console output */
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
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
      expect(mockLogModel.insertLog).toHaveBeenCalledTimes(1);
      expect(mockLogModel.insertLog).toHaveBeenCalledWith('/api/hello');
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error for this test
      mockLogModel.insertLog.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/hello');

      // Check that we get a 500 error
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });

      // Verify that the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error logging request:',
        expect.objectContaining({ message: 'Database error' })
      );
    });
  });

  describe('Log Model Integration', () => {
    it('should be able to retrieve logs by endpoint', async () => {
      // First make a request to create a log
      await request(app).get('/api/hello');

      // Then retrieve logs for that endpoint
      const logs = await mockLogModel.getLogsByEndpoint('/api/hello');

      // Check that we got the expected log
      expect(logs).toHaveLength(1);
      expect(logs[0].endpoint).toBe('/api/hello');
    });
  });
});
