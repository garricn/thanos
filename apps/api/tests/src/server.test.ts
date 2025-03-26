import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServer, defaultConfig, type Logger, type ProcessSignals } from '../../src/server.ts';
import { Express } from 'express';

describe('createServer', () => {
  let mockApp: Express;
  let mockLogger: Logger;
  let mockSignals: ProcessSignals;
  let shutdownHandler: () => void;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock Express app
    mockApp = {
      listen: vi.fn().mockImplementation((port, callback) => {
        callback();
        return {
          close: vi.fn(),
        };
      }),
    } as unknown as Express;

    // Create mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    // Create mock signals
    mockSignals = {
      onShutdown: vi.fn(handler => {
        shutdownHandler = handler;
      }),
    };
  });

  it('should create server with default config', () => {
    const server = createServer(mockApp, defaultConfig, mockLogger, mockSignals);

    expect(mockApp.listen).toHaveBeenCalledWith(defaultConfig.port, expect.any(Function));
    expect(mockLogger.info).toHaveBeenCalledWith(
      `API is running on http://localhost:${defaultConfig.port}`
    );
    expect(server).toBeDefined();
    expect(mockSignals.onShutdown).toHaveBeenCalled();
    expect(server.close).not.toHaveBeenCalled();
  });

  it('should create server with custom config', () => {
    const customConfig = { port: 4000 };
    const server = createServer(mockApp, customConfig, mockLogger, mockSignals);

    expect(mockApp.listen).toHaveBeenCalledWith(customConfig.port, expect.any(Function));
    expect(mockLogger.info).toHaveBeenCalledWith(
      `API is running on http://localhost:${customConfig.port}`
    );
    expect(server).toBeDefined();
    expect(mockSignals.onShutdown).toHaveBeenCalled();
    expect(server.close).not.toHaveBeenCalled();
  });

  it('should handle server shutdown', () => {
    const server = createServer(mockApp, defaultConfig, mockLogger, mockSignals);
    expect(server.close).not.toHaveBeenCalled();

    // Simulate shutdown
    shutdownHandler();

    expect(mockLogger.info).toHaveBeenCalledWith('Shutting down server...');
    expect(server.close).toHaveBeenCalled();
  });
});
