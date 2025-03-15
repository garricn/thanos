/**
 * Tests for the log model
 */

// Mock sqlite3
jest.mock('sqlite3', () => {
  // Create mock implementations
  const mockDb = {
    run: jest.fn((query, params, callback) => {
      if (callback) {
        callback.call({ lastID: 1 });
      }
    }),
    all: jest.fn((query, params, callback) => {
      if (typeof params === 'function') {
        params(null, [
          {
            id: 1,
            timestamp: '2025-03-08T00:00:00.000Z',
            endpoint: '/api/hello',
          },
        ]);
      } else {
        callback(null, [
          {
            id: 1,
            timestamp: '2025-03-08T00:00:00.000Z',
            endpoint: '/api/hello',
          },
        ]);
      }
    }),
    get: jest.fn((query, params, callback) => {
      callback(null, {
        id: 1,
        timestamp: '2025-03-08T00:00:00.000Z',
        endpoint: '/api/hello',
      });
    }),
    close: jest.fn((callback) => {
      callback();
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
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
  return undefined;
});
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
  return undefined;
});

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

      mockDb.run.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'));
      });

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

      mockDb.all.mockImplementationOnce((query, callback) => {
        callback(new Error('Database error'));
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

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'));
      });

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

      mockDb.all.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'));
      });

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

      mockDb.close.mockImplementationOnce((callback) => {
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
