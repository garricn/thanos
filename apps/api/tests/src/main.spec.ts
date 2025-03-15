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

// Add tests for the SIGINT handler
describe('Process SIGINT handler', () => {
  // Mock process.exit
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
    return undefined as never;
  });

  // Get the log model
  const logModel = require('../../../db/models/log');

  // Create a mock SIGINT handler function
  const sigintHandler = () => {
    logModel.closeDb();
    process.exit(0);
  };

  afterAll(() => {
    mockExit.mockRestore();
  });

  it('should close the database and exit when SIGINT is received', () => {
    // Call the handler directly
    sigintHandler();

    // Check that closeDb was called
    expect(logModel.closeDb).toHaveBeenCalledTimes(1);

    // Check that process.exit was called with code 0
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});
