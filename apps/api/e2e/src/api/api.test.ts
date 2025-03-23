import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../../src/main';
import type { Server } from 'http';

describe('API', () => {
  let server: Server;

  beforeAll(async () => {
    server = createServer();
  });

  afterAll(async () => {
    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });
  });

  it('should return Hello World from the root endpoint', async () => {
    const response = await axios.get('http://localhost:3000/');
    expect(response.status).toBe(200);
    expect(response.data).toBe('Hello World');
  });
});
