import request from 'supertest';
import express from 'express';

// Mock the log model
jest.mock(
  '../../db/models/log',
  () => ({
    insertLog: jest.fn().mockRejectedValue(new Error('Database error')),
  }),
  { virtual: true }
);

describe('API Hello Endpoint Error Handling', () => {
  let app: express.Application;

  beforeEach(() => {
    // Clear module cache to ensure fresh imports
    jest.resetModules();

    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {
      /* empty function */
    });

    // Import the app setup function after mocking dependencies
    const { setupApp } = require('../../src/app');

    // Create a new app instance
    app = setupApp();
  });

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  it('should handle database errors gracefully', async () => {
    // Make the request
    const response = await request(app).get('/api/hello');

    // Verify the response
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });

    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });
});
