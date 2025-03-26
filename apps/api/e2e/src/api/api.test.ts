import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, type Logger } from '../../../src/server.ts';
import { createApp } from '../../../src/app.ts';
import express from 'express';

describe('API', () => {
  let server: ReturnType<typeof createServer>;
  const TEST_PORT = 3001;

  const consoleLogger: Logger = {
    info: (message: string) => console.log(message),
    error: (message: string) => console.error(message),
  };

  beforeAll(() => {
    const app = createApp(express());
    server = createServer(app, { port: TEST_PORT }, consoleLogger, {
      onShutdown: () => {}, // No-op for tests
    });
  });

  afterAll(() => {
    server.close();
  });

  it('should return Hello World from the root endpoint', async () => {
    const response = await axios.get(`http://localhost:${TEST_PORT}/`);
    expect(response.data).toBe('Hello World');
  });

  it('should be running', () => {
    expect(server).toBeDefined();
  });
});
