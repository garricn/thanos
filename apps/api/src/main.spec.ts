import express from 'express';
import request from 'supertest';

// Mock express app
const app = express();

// Import the route handlers
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return a message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello API' });
    });
  });

  describe('GET /api/health', () => {
    it('should return status ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
