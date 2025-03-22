import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('API', () => {
  beforeAll(async () => {
    // Add any setup needed before tests
  });

  afterAll(async () => {
    // Add any cleanup needed after tests
  });

  it('should return Hello World from the root endpoint', async () => {
    const response = await axios.get('http://localhost:3000/');
    expect(response.status).toBe(200);
    expect(response.data).toBe('Hello World');
  });
});
