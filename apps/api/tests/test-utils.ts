import express from 'express';

// Create mock log model
export const mockLogModel = {
  insertLog: jest.fn().mockResolvedValue(1), // Mock returns ID 1
  getLogs: jest
    .fn()
    .mockResolvedValue([
      { id: 1, timestamp: '2025-03-08T00:00:00.000Z', endpoint: '/api/hello' },
    ]),
  getLogsByEndpoint: jest
    .fn()
    .mockResolvedValue([
      { id: 1, timestamp: '2025-03-08T00:00:00.000Z', endpoint: '/api/hello' },
    ]),
  closeDb: jest.fn(),
};

// Mock the database module
jest.mock('../db/models/log', () => mockLogModel, { virtual: true });

// Import the app after mocking the dependencies
import { setupApp } from '../src/app';

/**
 * Creates a test Express app for testing
 * @returns {express.Application} The configured Express app for testing
 */
export function createTestApp(): express.Application {
  return setupApp();
}
