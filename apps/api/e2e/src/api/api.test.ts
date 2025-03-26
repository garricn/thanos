import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../../src/main';
import { createApp } from '../../../src/app';
import type { Server } from 'http';

describe('API', () => {
  let server: Server;
  const TEST_PORT = 3001;

  beforeAll(async () => {
    const app = createApp();
    const consoleLogger = {
      info: (message: string) => console.log(message),
      error: (message: string) => console.error(message),
    };
    server = createServer(app, { port: TEST_PORT }, consoleLogger);
  });

  afterAll(async () => {
    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });
  });

  it('should return Hello World from the root endpoint', async () => {
    const response = await axios.get(`http://localhost:${TEST_PORT}/`);
    expect(response.status).toBe(200);
    expect(response.data).toBe('Hello World');
  });
});
