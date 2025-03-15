import * as fs from 'fs';

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
jest.mock(
  '../../db/models/log',
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

describe('Main Path Resolution', () => {
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

    // Mock app.listen to prevent server from actually starting
    const mockListen = jest.fn().mockImplementation((port, host, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    });

    // Mock setupApp to return an object with listen method
    jest.mock('../../src/app', () => ({
      setupApp: jest.fn(() => ({
        listen: mockListen,
      })),
    }));

    // Import the main module
    require('../../src/main');

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

    // Mock app.listen to prevent server from actually starting
    const mockListen = jest.fn().mockImplementation((port, host, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    });

    // Mock setupApp to return an object with listen method
    jest.mock('../../src/app', () => ({
      setupApp: jest.fn(() => ({
        listen: mockListen,
      })),
    }));

    // Import the main module
    require('../../src/main');

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

    // Mock app.listen to prevent server from actually starting
    const mockListen = jest.fn().mockImplementation((port, host, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    });

    // Mock setupApp to return an object with listen method
    jest.mock('../../src/app', () => ({
      setupApp: jest.fn(() => ({
        listen: mockListen,
      })),
    }));

    // Import the main module
    require('../../src/main');

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

    // Mock app.listen to prevent server from actually starting
    const mockListen = jest.fn().mockImplementation((port, host, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    });

    // Mock setupApp to return an object with listen method
    jest.mock('../../src/app', () => ({
      setupApp: jest.fn(() => ({
        listen: mockListen,
      })),
    }));

    try {
      // Import the main module
      require('../../src/main');
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
