import * as fs from 'fs';
import * as path from 'path';
import { jest } from '@jest/globals';
import request from 'supertest';
import { setupApp } from './app';

// Mock the fs module
jest.mock('fs', () => ({
  accessSync: jest.fn(),
  constants: { F_OK: 1 },
}));

// Mock the path module
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/')),
}));

// Mock the log model
const mockInsertLog = jest.fn().mockResolvedValue(undefined);
jest.mock(
  '../db/models/log',
  () => ({
    insertLog: mockInsertLog,
  }),
  { virtual: true }
);

describe('app.ts', () => {
  let originalConsoleError: typeof console.error;
  let mockConsoleError: jest.Mock;

  beforeEach(() => {
    // Save original console.error
    originalConsoleError = console.error;

    // Mock console.error
    mockConsoleError = jest.fn();
    console.error = mockConsoleError;

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  describe('setupApp', () => {
    it('should set up an Express app with routes', () => {
      const app = setupApp();
      expect(app).toBeDefined();
      expect(app.get).toBeDefined();
    });

    it('should disable x-powered-by header', () => {
      const app = setupApp();
      expect(app.disabled('x-powered-by')).toBe(true);
    });

    it('should handle GET / request', async () => {
      const app = setupApp();
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello API' });
    });

    it('should handle GET /api/health request', async () => {
      const app = setupApp();
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should handle GET /api/hello request successfully', async () => {
      const app = setupApp();
      const response = await request(app).get('/api/hello');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello from the backend!' });
      expect(mockInsertLog).toHaveBeenCalledWith('/api/hello');
    });

    it('should handle errors in GET /api/hello request', async () => {
      // Mock insertLog to throw an error
      mockInsertLog.mockRejectedValueOnce(new Error('Database error'));

      const app = setupApp();
      const response = await request(app).get('/api/hello');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error logging request:',
        expect.any(Error)
      );
    });
  });
});
