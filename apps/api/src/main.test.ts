import * as fs from 'fs';
import * as path from 'path';
import { jest } from '@jest/globals';

// Mock the fs module
jest.mock('fs', () => ({
  accessSync: jest.fn(),
  constants: { F_OK: 1 },
}));

// Mock the path module
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/')),
}));

// Mock the app module
jest.mock('./app', () => ({
  setupApp: jest.fn().mockReturnValue({
    listen: jest.fn((port, host, callback: () => void) => {
      callback();
      return { close: jest.fn() };
    }),
  }),
}));

// Mock console.error and console.log
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const mockConsoleError = jest.fn();
const mockConsoleLog = jest.fn();

// Mock the log model
const mockCloseDb = jest.fn();
jest.mock(
  '../db/models/log',
  () => ({
    closeDb: mockCloseDb,
  }),
  { virtual: true }
);

describe('main.ts', () => {
  let processExitSpy: any;
  let processOnSpy: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock console methods
    console.error = mockConsoleError;
    console.log = mockConsoleLog;

    // Spy on process.exit
    processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    // Spy on process.on
    processOnSpy = jest.spyOn(process, 'on');

    // Reset modules to ensure main.ts is reloaded with fresh mocks
    jest.resetModules();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;

    // Restore process.exit
    processExitSpy.mockRestore();

    // Restore process.on
    processOnSpy.mockRestore();
  });

  test('should start the server with default host and port', () => {
    // Mock fs.accessSync to succeed for the first path
    (fs.accessSync as jest.Mock).mockImplementation(() => undefined);

    // Import main.ts (this will execute the file)
    require('./main');

    // Verify setupApp was called
    const { setupApp } = require('./app');
    expect(setupApp).toHaveBeenCalled();

    // Verify app.listen was called with correct parameters
    const app = setupApp();
    expect(app.listen).toHaveBeenCalledWith(
      3000,
      'localhost',
      expect.any(Function)
    );

    // Verify console.log was called with the correct messages
    expect(console.log).toHaveBeenCalledWith('[ ready ] http://localhost:3000');
    expect(console.log).toHaveBeenCalledWith(
      'Try the new endpoint at http://localhost:3000/api/hello'
    );
  });

  test('should handle custom host and port from environment variables', () => {
    // Mock fs.accessSync to succeed for the first path
    (fs.accessSync as jest.Mock).mockImplementation(() => undefined);

    // Set environment variables
    const originalEnv = process.env;
    process.env.HOST = 'custom-host';
    process.env.PORT = '4000';

    // Import main.ts (this will execute the file)
    jest.resetModules();
    require('./main');

    // Verify app.listen was called with correct parameters
    const { setupApp } = require('./app');
    const app = setupApp();
    expect(app.listen).toHaveBeenCalledWith(
      4000,
      'custom-host',
      expect.any(Function)
    );

    // Restore environment variables
    process.env = originalEnv;
  });

  test('should handle case when no log model path is found', () => {
    // Mock fs.accessSync to fail for all paths
    (fs.accessSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    // Import main.ts (this will execute the file)
    jest.resetModules();
    require('./main');

    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith(
      'Could not find log model at any of the expected paths:'
    );
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('- '));
  });

  test('should set up graceful shutdown handler', () => {
    // Mock fs.accessSync to succeed for the first path
    (fs.accessSync as jest.Mock).mockImplementation(() => undefined);

    // Import main.ts (this will execute the file)
    jest.resetModules();
    require('./main');

    // Verify process.on was called with SIGINT
    expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));

    // Get the SIGINT handler
    const sigintHandler = processOnSpy.mock.calls.find(
      (call: any[]) => call[0] === 'SIGINT'
    )?.[1];
    expect(sigintHandler).toBeDefined();

    // Call the SIGINT handler
    if (sigintHandler) {
      sigintHandler();

      // Verify closeDb was called
      expect(mockCloseDb).toHaveBeenCalled();

      // Verify process.exit was called with 0
      expect(processExitSpy).toHaveBeenCalledWith(0);
    }
  });
});
