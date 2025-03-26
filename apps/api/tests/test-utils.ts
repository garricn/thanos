import express from 'express';
import { vi } from 'vitest';

// Create mock log model
export const mockLogModel = {
  insertLog: vi.fn().mockResolvedValue(1), // Mock returns ID 1
  getLogs: vi
    .fn()
    .mockResolvedValue([{ id: 1, timestamp: '2025-03-08T00:00:00.000Z', endpoint: '/api/hello' }]),
  getLogsByEndpoint: vi
    .fn()
    .mockResolvedValue([{ id: 1, timestamp: '2025-03-08T00:00:00.000Z', endpoint: '/api/hello' }]),
  closeDb: vi.fn(),
};

// Mock the database module before importing the app
// This is necessary to ensure the mock is in place before the app is loaded
vi.mock('../db/models/log', () => mockLogModel);

// We need to dynamically import here because we have to mock the module before importing it
// Using dynamic import pattern for ES modules
const appModule = await import('../src/app.ts');
const { createApp } = appModule;

/**
 * Creates a test Express app for testing
 * @returns {express.Application} The configured Express app for testing
 */
export function createTestApp(): express.Application {
  return createApp();
}
