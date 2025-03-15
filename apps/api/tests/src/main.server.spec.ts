/**
 * Tests for the server setup in main.ts
 */

// Mock the app.listen method
const mockListen = jest.fn().mockImplementation((port, host, callback) => {
  // Call the callback to simulate server start
  if (callback) callback();
  return { close: jest.fn() };
});

// Mock the setupApp function
jest.mock('../../src/app', () => ({
  setupApp: jest.fn(() => ({
    listen: mockListen,
  })),
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
const serverConsoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation(() => {
    /* empty function to suppress console output */
  });

describe('API Server', () => {
  // Save original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore environment variables
    process.env = originalEnv;

    // Restore console.log
    serverConsoleLogSpy.mockRestore();
  });

  it('should start the server with default host and port', () => {
    // Import the main module to trigger the server setup
    require('../../src/main');

    // Check that setupApp was called
    const { setupApp } = require('../../src/app');
    expect(setupApp).toHaveBeenCalledTimes(1);

    // Check that listen was called with the correct parameters
    expect(mockListen).toHaveBeenCalledTimes(1);
    expect(mockListen).toHaveBeenCalledWith(
      3000,
      'localhost',
      expect.any(Function)
    );

    // Check that console.log was called with the correct messages
    expect(serverConsoleLogSpy).toHaveBeenCalledWith(
      '[ ready ] http://localhost:3000'
    );
    expect(serverConsoleLogSpy).toHaveBeenCalledWith(
      'Try the new endpoint at http://localhost:3000/api/hello'
    );
  });

  it('should use custom host and port from environment variables', () => {
    // Set environment variables
    process.env.HOST = 'custom-host';
    process.env.PORT = '4000';

    // Clear module cache to force re-import
    jest.resetModules();

    // Import the main module to trigger the server setup
    require('../../src/main');

    // Check that listen was called with the correct parameters
    expect(mockListen).toHaveBeenCalledTimes(1);
    expect(mockListen).toHaveBeenCalledWith(
      4000,
      'custom-host',
      expect.any(Function)
    );

    // Check that console.log was called with the correct messages
    expect(serverConsoleLogSpy).toHaveBeenCalledWith(
      '[ ready ] http://custom-host:4000'
    );
    expect(serverConsoleLogSpy).toHaveBeenCalledWith(
      'Try the new endpoint at http://custom-host:4000/api/hello'
    );
  });

  it('should handle invalid port number gracefully', () => {
    // Set environment variables with invalid port
    process.env.PORT = 'invalid';

    // Clear module cache to force re-import
    jest.resetModules();

    // Import the main module to trigger the server setup
    require('../../src/main');

    // Check that listen was called with the correct parameters
    expect(mockListen).toHaveBeenCalledTimes(1);

    // The first parameter should be NaN because Number('invalid') is NaN
    // We can't directly check for NaN because NaN !== NaN
    // So we check that the port parameter is not a number
    const firstCallArgs = mockListen.mock.calls[0];
    expect(typeof firstCallArgs[0]).toBe('number');
    expect(isNaN(firstCallArgs[0])).toBe(true);

    // Check the other parameters
    expect(firstCallArgs[1]).toBe('localhost');
    expect(typeof firstCallArgs[2]).toBe('function');
  });
});
