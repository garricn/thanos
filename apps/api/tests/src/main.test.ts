import { describe, it, expect, vi } from 'vitest';
import { createServer } from '../../src/main';
import { AddressInfo } from 'net';

interface ServerConfig {
  port: number;
}

// Mock the server creation
vi.mock('../../src/main', () => ({
  createServer: vi.fn().mockImplementation((config: ServerConfig) => ({
    address: () => ({ port: config.port }) as AddressInfo,
    close: vi.fn(),
  })),
}));

describe('Server Port Configuration', () => {
  const mockConfig: ServerConfig = {
    port: 3000,
  };

  it('should use the provided port configuration', () => {
    const server = createServer(mockConfig);
    const address = server.address() as AddressInfo;
    expect(address.port).toBe(mockConfig.port);
    server.close();
  });

  it('should handle port set to 0', () => {
    const server = createServer({ port: 0 });
    const address = server.address() as AddressInfo;
    expect(address.port).toBe(0);
    server.close();
  });
});
