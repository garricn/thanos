import { describe, it, expect, vi } from 'vitest';
import { createServer } from '../../src/main';
import { Express } from 'express';

describe('Server Creation', () => {
  it('should use the provided app', () => {
    const mockApp = {
      listen: vi.fn().mockReturnValue({ address: () => ({ port: 3000 }), close: vi.fn() }),
    } as unknown as Express;

    createServer(mockApp);
    expect(mockApp.listen).toHaveBeenCalled();
  });
});
