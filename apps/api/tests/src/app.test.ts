import { describe, it, expect, vi } from 'vitest';
import { createApp } from '../../src/app.ts';
import { Express } from 'express';

describe('createApp', () => {
  it('should configure routes correctly', () => {
    // Create mock Express app
    const mockExpress: Express = {
      get: vi.fn(),
    } as unknown as Express;

    // Create app with mock Express
    const app = createApp(mockExpress);

    // Verify route was configured
    expect(mockExpress.get).toHaveBeenCalledWith('/', expect.any(Function));
    expect(app).toBe(mockExpress);
  });

  it('should handle root route correctly', () => {
    // Create mock request and response
    const mockReq = {};
    const mockRes = {
      send: vi.fn(),
    };

    // Create mock Express app that calls route handler directly
    const mockExpress: Express = {
      get: vi.fn((path, handler) => {
        if (path === '/') {
          handler(mockReq, mockRes, () => {});
        }
      }),
    } as unknown as Express;

    // Create app with mock Express
    createApp(mockExpress);

    // Verify response
    expect(mockRes.send).toHaveBeenCalledWith('Hello World');
  });
});
