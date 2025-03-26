import { describe, it, expect, vi } from 'vitest';
import { createServer } from '../../src/main';
import { Express } from 'express';

interface Logger {
  info(message: string): void;
  error(message: string): void;
}

describe('Server Creation', () => {
  it('should create server with app and logger', () => {
    const mockApp = {
      listen: vi.fn((port, callback) => {
        callback();
        return { address: () => ({ port: 3000 }), close: vi.fn() };
      }),
    } as unknown as Express;

    const mockLogger: Logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    createServer(mockApp, { port: 3000 }, mockLogger);

    expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(mockLogger.info).toHaveBeenCalledWith('API is running on http://localhost:3000');
  });
});
