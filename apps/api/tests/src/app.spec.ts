import * as fs from 'fs';
import request from 'supertest';
import { setupApp } from '@thanos/api/app';

// Mock fs.accessSync
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  accessSync: jest.fn(),
  constants: { F_OK: 0 },
}));

// Mock path.join
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn().mockImplementation((...args) => args.join('/')),
}));

// Mock the log model
const logModelPath = '../../db/models/log';
jest.mock(
  logModelPath,
  () => ({
    insertLog: jest.fn().mockResolvedValue(1),
    closeDb: jest.fn(),
  }),
  { virtual: true }
);

describe('App Path Resolution', () => {
  // Save original console.error
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console.error to prevent noise in test output
    console.error = jest.fn();

    // Reset module registry before each test
    jest.resetModules();

    // Clear mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should find the log model at the first path', () => {
    // Mock fs.accessSync to succeed for the first path
    (fs.accessSync as jest.Mock).mockImplementation((filePath) => {
      if (filePath.includes('__dirname/../db/models/log.js')) {
        return true;
      }
      throw new Error('File not found');
    });

    // Import the app module
    require('../../src/app');

    // Check that fs.accessSync was called with the correct paths
    expect(fs.accessSync).toHaveBeenCalledWith(
      expect.stringContaining('__dirname/../db/models/log.js'),
      fs.constants.F_OK
    );

    // Check that console.error was not called
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should find the log model at the second path', () => {
    // Mock fs.accessSync to fail for the first path but succeed for the second
    (fs.accessSync as jest.Mock).mockImplementation((filePath) => {
      if (filePath.includes('__dirname/../../db/models/log.js')) {
        return true;
      }
      if (filePath.includes('__dirname/../db/models/log.js')) {
        throw new Error('File not found');
      }
      throw new Error('File not found');
    });

    // Import the app module
    require('../../src/app');

    // Check that fs.accessSync was called with the correct paths
    expect(fs.accessSync).toHaveBeenCalledWith(
      expect.stringContaining('__dirname/../db/models/log.js'),
      fs.constants.F_OK
    );
    expect(fs.accessSync).toHaveBeenCalledWith(
      expect.stringContaining('__dirname/../../db/models/log.js'),
      fs.constants.F_OK
    );

    // Check that console.error was not called
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should find the log model at the third path', () => {
    // Mock fs.accessSync to fail for the first and second paths but succeed for the third
    (fs.accessSync as jest.Mock).mockImplementation((filePath) => {
      if (filePath.includes('__dirname/../../../db/models/log.js')) {
        return true;
      }
      if (
        filePath.includes('__dirname/../db/models/log.js') ||
        filePath.includes('__dirname/../../db/models/log.js')
      ) {
        throw new Error('File not found');
      }
      throw new Error('File not found');
    });

    // Import the app module
    require('../../src/app');

    // Check that fs.accessSync was called with the correct paths
    expect(fs.accessSync).toHaveBeenCalledWith(
      expect.stringContaining('__dirname/../db/models/log.js'),
      fs.constants.F_OK
    );
    expect(fs.accessSync).toHaveBeenCalledWith(
      expect.stringContaining('__dirname/../../db/models/log.js'),
      fs.constants.F_OK
    );
    expect(fs.accessSync).toHaveBeenCalledWith(
      expect.stringContaining('__dirname/../../../db/models/log.js'),
      fs.constants.F_OK
    );

    // Check that console.error was not called
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should log an error if no path is found', () => {
    // Mock fs.accessSync to fail for all paths
    (fs.accessSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    // Mock require to prevent actual module loading
    jest.mock(
      '../../src/app',
      () => {
        // This will trigger the path resolution code but prevent actual module loading
        const mockRequire = jest.fn();
        return mockRequire;
      },
      { virtual: true }
    );

    try {
      // Import the app module
      require('../../src/app');
    } catch (_) {
      // Ignore the error
    }

    // Check that fs.accessSync was called for all paths
    expect(fs.accessSync).toHaveBeenCalledTimes(3);

    // Check that console.error was called
    expect(console.error).toHaveBeenCalledWith(
      'Could not find log model at any of the expected paths:'
    );
  });
});

describe('setupApp', () => {
  describe('/api/hello endpoint', () => {
    it('should return hello message and log the request', async () => {
      // ... existing code ...
    });

    it('should handle database errors gracefully', async () => {
      // Mock the log model to throw an error
      const mockInsertLog = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));
      jest.mock(
        logModelPath,
        () => ({
          insertLog: mockInsertLog,
        }),
        { virtual: true }
      );

      // Create a new app instance with the mocked log model
      const app = setupApp();

      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Make the request
      const response = await request(app).get('/api/hello');

      // Restore console.error
      console.error = originalConsoleError;

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
      expect(mockInsertLog).toHaveBeenCalledWith('/api/hello');
    });
  });
});
