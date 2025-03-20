import request from 'supertest';
import { createApp } from '../../src/app.ts';

describe('API App', () => {
  it('should return Hello World', async () => {
    const app = createApp();
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World');
  });
});
