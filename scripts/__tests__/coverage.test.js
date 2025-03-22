/**
 * Tests for the coverage script
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  moveSonarReports,
  ensureTestDirectories,
  ensureCombineDirectories,
} from '../bin/coverage.js';
import path from 'node:path';
import {
  mockExistsSync,
  mockCopyFileSync,
  mockUnlinkSync,
  mockConsoleLog,
  mockConsoleError,
  mockMkdirSync,
  setupMockDefaults,
} from './test-utils.js';

describe('Coverage Script', () => {
  beforeEach(() => {
    setupMockDefaults();
    // Reset mock implementations for tests
    mockExistsSync.mockReset();
    mockCopyFileSync.mockReset();
    mockUnlinkSync.mockReset();
    mockMkdirSync.mockReset();
  });

  describe('ensureCombineDirectories', () => {
    it('creates combined coverage directory if it does not exist', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      ensureCombineDirectories();

      // Assert
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/combined', {
        recursive: true,
      });
    });
  });

  describe('ensureTestDirectories', () => {
    it('creates unit test directories when type is unit', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      ensureTestDirectories('unit');

      // Assert
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/api/unit', {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/web/unit', {
        recursive: true,
      });
      expect(mockMkdirSync).not.toHaveBeenCalledWith('coverage/web/snapshot', {
        recursive: true,
      });
    });

    it('creates all test directories when type is all', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      ensureTestDirectories('all');

      // Assert
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/api/unit', {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/web/unit', {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/web/snapshot', {
        recursive: true,
      });
    });

    it('creates snapshot test directory when type is snapshot', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      ensureTestDirectories('snapshot');

      // Assert
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/web/snapshot', {
        recursive: true,
      });
      expect(mockMkdirSync).not.toHaveBeenCalledWith('coverage/api/unit', {
        recursive: true,
      });
      expect(mockMkdirSync).not.toHaveBeenCalledWith('coverage/web/unit', {
        recursive: true,
      });
    });
  });

  describe('moveSonarReports', () => {
    it('should move API report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation((path) =>
        path.includes('apps/api/test-report.xml')
      );

      // Act
      const result = moveSonarReports('api');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/api/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Moved file')
      );
    });

    it('should move web unit report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation((path) =>
        path.includes('apps/web/test-report.xml')
      );

      // Act
      const result = moveSonarReports('web-unit');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/web/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Moved file')
      );
    });

    it('should move web snapshot report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation((path) =>
        path.includes('apps/web/test-report.xml')
      );

      // Act
      const result = moveSonarReports('web-snapshot');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/web/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Moved file')
      );
    });

    it('should handle missing source file', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      const result = moveSonarReports('api');

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Source file not found')
      );
    });

    it('should handle invalid report type', () => {
      // Act
      const result = moveSonarReports('invalid');

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Invalid report type')
      );
    });

    it('should handle file operation errors', () => {
      // Arrange
      mockExistsSync.mockReturnValue(true);
      mockCopyFileSync.mockImplementation(() => {
        throw new Error('Mock file operation error');
      });

      // Act
      const result = moveSonarReports('api');

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error moving file')
      );
    });
  });
});
