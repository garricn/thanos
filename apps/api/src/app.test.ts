import * as fs from 'fs';
import * as path from 'path';
import { jest } from '@jest/globals';
import request from 'supertest';
import { setupApp, findLogModelPath } from './app';

// Mock the fs module
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    accessSync: jest.fn(),
    constants: { F_OK: 1 },
    // Include other methods as needed
  };
});

// Mock the path module
jest.mock('path', () => {
  return {
    join: jest.fn().mockImplementation((...args) => args.join('/')),
    // Include other methods as needed
  };
});

// Mock the log model
const mockInsertLog = jest.fn();
mockInsertLog.mockResolvedValue(undefined);

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

  describe('findLogModelPath', () => {
    it('should return the first valid path', () => {
      // Mock fs.accessSync to succeed for the second path
      let callCount = 0;
      (fs.accessSync as jest.Mock).mockImplementation((path) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('File not found');
        }
        return undefined;
      });

      const result = findLogModelPath();

      // Verify that accessSync was called twice (first fails, second succeeds)
      expect(fs.accessSync).toHaveBeenCalledTimes(2);

      // Verify the result is the second path
      expect(result).toBe('__dirname/../db/models/log');

      // Verify that console.error was not called
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should handle when no path is found and execute the if (!logModelPath) branch', () => {
      // Mock fs.accessSync to fail for all paths
      (fs.accessSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      // Mock path.join for the default path
      (path.join as jest.Mock).mockImplementation((...args) => {
        // Return a specific value for the default path to verify it's used
        if (
          args.includes('..') &&
          args.includes('db') &&
          args.includes('models') &&
          args.includes('log')
        ) {
          return '__dirname/../db/models/log';
        }
        return args.join('/');
      });

      const result = findLogModelPath();

      // Verify that accessSync was called for all paths
      expect(fs.accessSync).toHaveBeenCalledTimes(3);

      // Verify that console.error was called with the expected messages
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Could not find log model at any of the expected paths:'
      );

      // Verify the forEach was called by checking if console.error was called multiple times
      expect(mockConsoleError).toHaveBeenCalledTimes(4); // Once for the main message and once for each path

      // Verify the result is the default path
      expect(result).toBe('__dirname/../db/models/log');

      // Verify that path.join was called for the default path
      expect(path.join).toHaveBeenCalledWith(
        '__dirname',
        '..',
        'db',
        'models',
        'log'
      );
    });
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
      const error = new Error('Database error');
      mockInsertLog.mockRejectedValueOnce(error);

      const app = setupApp();
      const response = await request(app).get('/api/hello');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error logging request:',
        error
      );
    });
  });
});
