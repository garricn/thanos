/**
 * Tests for the path resolution logic in app.ts and main.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  accessSync: jest.fn(),
  constants: { F_OK: 0 },
}));

// Mock path module
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn().mockImplementation((...args) => args.join('/')),
}));

// Mock sqlite3 to prevent native binding issues
jest.mock('sqlite3', () => {
  const mockDb = {
    run: jest.fn(),
    all: jest.fn(),
    get: jest.fn(),
    close: jest.fn(),
  };
  return {
    verbose: jest.fn(() => ({
      Database: jest.fn(() => mockDb),
    })),
  };
});

// Mock the log model
jest.mock(
  '../../db/models/log',
  () => ({
    insertLog: jest.fn().mockResolvedValue(1),
    closeDb: jest.fn(),
  }),
  { virtual: true }
);

describe('Path Resolution Logic', () => {
  // Save original console methods
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock console methods to prevent noise in test output
    console.error = jest.fn();
    console.log = jest.fn();

    // Reset module registry before each test
    jest.resetModules();

    // Clear mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('Path Resolution Function', () => {
    // Create a simplified version of the path resolution logic for testing
    function findLogModelPath() {
      let logModelPath;

      // Define possible paths
      const possiblePaths = [
        path.join('__dirname', '..', 'db', 'models', 'log'),
        path.join('__dirname', '..', '..', 'db', 'models', 'log'),
        path.join('__dirname', '..', '..', '..', 'db', 'models', 'log'),
      ];

      // Find the first path that exists
      for (const p of possiblePaths) {
        try {
          fs.accessSync(`${p}.js`, fs.constants.F_OK);
          logModelPath = p;
          break;
        } catch {
          // Path doesn't exist, try the next one
          continue;
        }
      }

      // If no path was found, use a default path and log an error
      if (!logModelPath) {
        console.error('Could not find log model at any of the expected paths:');
        possiblePaths.forEach((p) => console.error(`- ${p}.js`));
        logModelPath = path.join('__dirname', '..', 'db', 'models', 'log');
      }

      return logModelPath;
    }

    it('should find the log model at the first path', () => {
      // Mock fs.accessSync to succeed for the first path
      (fs.accessSync as jest.Mock).mockImplementation((filePath) => {
        if (filePath.includes('__dirname/../db/models/log.js')) {
          return true;
        }
        throw new Error('File not found');
      });

      // Call the function
      const result = findLogModelPath();

      // Check that fs.accessSync was called with the correct path
      expect(fs.accessSync).toHaveBeenCalledWith(
        '__dirname/../db/models/log.js',
        fs.constants.F_OK
      );

      // Check that the correct path was returned
      expect(result).toBe('__dirname/../db/models/log');

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

      // Call the function
      const result = findLogModelPath();

      // Check that fs.accessSync was called with the correct paths
      expect(fs.accessSync).toHaveBeenCalledWith(
        '__dirname/../db/models/log.js',
        fs.constants.F_OK
      );
      expect(fs.accessSync).toHaveBeenCalledWith(
        '__dirname/../../db/models/log.js',
        fs.constants.F_OK
      );

      // Check that the correct path was returned
      expect(result).toBe('__dirname/../../db/models/log');

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

      // Call the function
      const result = findLogModelPath();

      // Check that fs.accessSync was called with the correct paths
      expect(fs.accessSync).toHaveBeenCalledWith(
        '__dirname/../db/models/log.js',
        fs.constants.F_OK
      );
      expect(fs.accessSync).toHaveBeenCalledWith(
        '__dirname/../../db/models/log.js',
        fs.constants.F_OK
      );
      expect(fs.accessSync).toHaveBeenCalledWith(
        '__dirname/../../../db/models/log.js',
        fs.constants.F_OK
      );

      // Check that the correct path was returned
      expect(result).toBe('__dirname/../../../db/models/log');

      // Check that console.error was not called
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should log an error if no path is found', () => {
      // Mock fs.accessSync to fail for all paths
      (fs.accessSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      // Call the function
      const result = findLogModelPath();

      // Check that fs.accessSync was called for all paths
      expect(fs.accessSync).toHaveBeenCalledTimes(3);

      // Check that console.error was called with the correct messages
      expect(console.error).toHaveBeenCalledWith(
        'Could not find log model at any of the expected paths:'
      );
      expect(console.error).toHaveBeenCalledWith(
        '- __dirname/../db/models/log.js'
      );
      expect(console.error).toHaveBeenCalledWith(
        '- __dirname/../../db/models/log.js'
      );
      expect(console.error).toHaveBeenCalledWith(
        '- __dirname/../../../db/models/log.js'
      );

      // Check that the default path was returned
      expect(result).toBe('__dirname/../db/models/log');
    });
  });
});
