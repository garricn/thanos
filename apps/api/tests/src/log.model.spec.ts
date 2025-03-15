/**
 * Tests for the log model
 */

// Mock sqlite3
jest.mock('sqlite3', () => {
  // Create mock implementations
  const mockDb = {
    run: jest.fn((query: string, params: unknown, callback: (err: Error | null) => void) => {
      if (callback) {
        callback.call({ lastID: 1 }, null);
      }
    }),
    all: jest.fn((query: string, params: unknown | ((err: Error | null, rows: unknown[]) => void), callback?: (err: Error | null, rows: unknown[]) => void) => {
      if (typeof params === 'function') {
        params(null, [
          {
            id: 1,
            timestamp: '2025-03-08T00:00:00.000Z',
            endpoint: '/api/hello',
          },
        ]);
      } else {
        if (callback) {
          callback(null, [
            {
              id: 1,
              timestamp: '2025-03-08T00:00:00.000Z',
              endpoint: '/api/hello',
            },
          ]);
        }
      }
    }),
    get: jest.fn((query: string, params: unknown, callback: (err: Error | null, row: unknown) => void) => {
      callback(null, {
        id: 1,
        timestamp: '2025-03-08T00:00:00.000Z',
        endpoint: '/api/hello',
      });
    }),
    close: jest.fn((callback: (err: Error | null) => void) => {
      callback(null);
    }),
  };

  return {
    verbose: jest.fn(() => ({
      Database: jest.fn(() => mockDb),
    })),
    Database: jest.fn(() => mockDb),
  };
});

// Mock console methods
const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation(() => undefined);
const consoleErrorSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

// Import the log model
const logModel = require('../../db/models/log');

describe('Log Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('insertLog', () => {
    it('should insert a log and return the ID', async () => {
      const id = await logModel.insertLog('/api/test');
      expect(id).toBe(1);
    });

    it('should handle database errors when inserting', async () => {
      // Mock a database error
      const sqlite3 = require('sqlite3');
      const mockDb = sqlite3.verbose().Database();

      mockDb.run.mockImplementationOnce(
        (query: string, params: unknown, callback: (err: Error | null) => void) => {
          callback(new Error('Database error'));
        }
      );

      await expect(logModel.insertLog('/api/test')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getLogs', () => {
    it('should return all logs', async () => {
      const logs = await logModel.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].endpoint).toBe('/api/hello');
    });

    it('should handle database errors when getting logs', async () => {
      // Mock a database error
      const sqlite3 = require('sqlite3');
      const mockDb = sqlite3.verbose().Database();

      mockDb.all.mockImplementationOnce((query: string, callback: (err: Error | null, rows: unknown[]) => void) => {
        callback(new Error('Database error'), []);
      });

      await expect(logModel.getLogs()).rejects.toThrow('Database error');
    });
  });

  describe('getLogById', () => {
    it('should return a log by ID', async () => {
      const log = await logModel.getLogById(1);
      expect(log.id).toBe(1);
      expect(log.endpoint).toBe('/api/hello');
    });

    it('should handle database errors when getting a log by ID', async () => {
      // Mock a database error
      const sqlite3 = require('sqlite3');
      const mockDb = sqlite3.verbose().Database();

      mockDb.get.mockImplementationOnce(
        (query: string, params: unknown, callback: (err: Error | null, row: unknown) => void) => {
          callback(new Error('Database error'), null);
        }
      );

      await expect(logModel.getLogById(1)).rejects.toThrow('Database error');
    });
  });

  describe('getLogsByEndpoint', () => {
    it('should return logs by endpoint', async () => {
      const logs = await logModel.getLogsByEndpoint('/api/hello');
      expect(logs).toHaveLength(1);
      expect(logs[0].endpoint).toBe('/api/hello');
    });

    it('should handle database errors when getting logs by endpoint', async () => {
      // Mock a database error
      const sqlite3 = require('sqlite3');
      const mockDb = sqlite3.verbose().Database();

      mockDb.all.mockImplementationOnce(
        (query: string, params: unknown, callback: (err: Error | null, rows: unknown[]) => void) => {
          callback(new Error('Database error'), []);
        }
      );

      await expect(logModel.getLogsByEndpoint('/api/hello')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('closeDb', () => {
    it('should close the database connection', () => {
      logModel.closeDb();

      const sqlite3 = require('sqlite3');
      const mockDb = sqlite3.verbose().Database();

      expect(mockDb.close).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Database connection closed');
    });

    it('should handle errors when closing the database', () => {
      // Mock a database error
      const sqlite3 = require('sqlite3');
      const mockDb = sqlite3.verbose().Database();

      mockDb.close.mockImplementationOnce((callback: (err: Error | null) => void) => {
        callback(new Error('Close error'));
      });

      logModel.closeDb();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error closing database:',
        'Close error'
      );
    });
  });
});
