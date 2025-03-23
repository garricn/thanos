/**
 * Tests for the coverage script
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  moveSonarReports,
  ensureTestDirectories,
  ensureCombineDirectories,
  cleanCoverage,
  runUnitTests,
  runSnapshotTests,
  combineCoverage,
  generateReport,
  openReports,
  saveCoverageTrend,
  main,
} from '../bin/coverage.js';
import {
  mockExistsSync,
  mockCopyFileSync,
  mockUnlinkSync,
  mockConsoleLog,
  mockConsoleError,
  mockMkdirSync,
  mockExecSync,
  mockReadFileSync,
  mockWriteFileSync,
  setupMockDefaults,
} from './test-utils.js';

describe.skip('Coverage Script', () => {
  beforeEach(() => {
    setupMockDefaults();
    // Reset mock implementations for tests
    mockExistsSync.mockReset();
    mockCopyFileSync.mockReset();
    mockUnlinkSync.mockReset();
    mockMkdirSync.mockReset();
    mockExecSync.mockReset();
    mockReadFileSync.mockReset();
    mockWriteFileSync.mockReset();
  });

  describe('saveCoverageTrend', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('creates new trend file when none exists', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('lcov.info');
      });
      mockReadFileSync.mockImplementation(path => {
        if (path.includes('lcov.info')) {
          return 'LF:10\nLH:5\nend_of_record';
        }
        return '';
      });

      // Act
      saveCoverageTrend();

      // Assert
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'coverage/trend.json',
        expect.stringContaining('2024-01-01')
      );
      const savedData = JSON.parse(mockWriteFileSync.mock.calls[0][1]);
      expect(savedData).toEqual([
        {
          date: '2024-01-01T00:00:00.000Z',
          coverage: 50.0,
          totalLines: 10,
          linesCovered: 5,
        },
      ]);
    });

    it('appends to existing trend file', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('lcov.info') || path.includes('trend.json');
      });
      mockReadFileSync.mockImplementation(path => {
        if (path.includes('lcov.info')) {
          return 'LF:10\nLH:5\nend_of_record';
        }
        if (path.includes('trend.json')) {
          return JSON.stringify([
            {
              date: '2023-12-31T00:00:00.000Z',
              coverage: 40.0,
              totalLines: 10,
              linesCovered: 4,
            },
          ]);
        }
        return '';
      });

      // Act
      saveCoverageTrend();

      // Assert
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'coverage/trend.json',
        expect.stringContaining('2024-01-01')
      );
      const savedData = JSON.parse(mockWriteFileSync.mock.calls[0][1]);
      expect(savedData).toEqual([
        {
          date: '2023-12-31T00:00:00.000Z',
          coverage: 40.0,
          totalLines: 10,
          linesCovered: 4,
        },
        {
          date: '2024-01-01T00:00:00.000Z',
          coverage: 50.0,
          totalLines: 10,
          linesCovered: 5,
        },
      ]);
    });

    it('handles case when no coverage data exists', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      saveCoverageTrend();

      // Assert
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe('openReports', () => {
    it('opens coverage reports in the browser', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('lcov-report');
      });

      // Act
      openReports();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Opening coverage reports')
      );
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('open'), {
        stdio: 'inherit',
      });
    });

    it('handles case when no reports exist', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      openReports();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No coverage reports found to open')
      );
      expect(mockExecSync).not.toHaveBeenCalled();
    });
  });

  describe('generateReport', () => {
    it('generates coverage report', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('lcov.info') || path.includes('lcov-report');
      });

      // Act
      generateReport();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Generating coverage report')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Coverage reports generated at:')
      );
    });

    it('generates detailed coverage report', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('lcov.info') || path.includes('coverage-final.json');
      });

      // Act
      generateReport(true);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Generating coverage report')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Coverage reports generated at:')
      );
    });
  });

  describe('combineCoverage', () => {
    it('combines LCOV files from all coverage directories', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('lcov.info') || path.includes('lcov-report');
      });

      // Act
      combineCoverage();

      // Assert
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'coverage/combined/lcov.info',
        expect.any(String)
      );
    });
  });

  describe('runSnapshotTests', () => {
    it('runs snapshot tests with coverage', () => {
      // Arrange
      mockExecSync.mockImplementation(command => {
        if (command.includes('testNamePattern=snapshot')) return '';
        throw new Error('Unexpected command');
      });

      // Act
      runSnapshotTests();

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('testNamePattern=snapshot'),
        { stdio: 'inherit' }
      );
    });
  });

  describe('runUnitTests', () => {
    it('runs unit tests for API and Web with coverage', () => {
      // Arrange
      mockExecSync.mockImplementation(command => {
        if (command.includes('--workspace=apps/api')) return '';
        if (command.includes('--workspace=apps/web')) return '';
        throw new Error('Unexpected command');
      });

      // Act
      runUnitTests();

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('--workspace=apps/api'), {
        stdio: 'inherit',
      });
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('--workspace=apps/web'), {
        stdio: 'inherit',
      });
    });
  });

  describe('cleanCoverage', () => {
    it('cleans coverage directories', () => {
      // Act
      cleanCoverage();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Cleaning coverage directories')
      );
      expect(mockExecSync).toHaveBeenCalledWith('rm -rf coverage', {
        stdio: 'inherit',
      });
    });
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
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/scripts/unit', {
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
      expect(mockMkdirSync).toHaveBeenCalledWith('coverage/scripts/unit', {
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
    });
  });

  describe('moveSonarReports', () => {
    it('should move API report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('test-report.xml');
      });

      // Act
      const result = moveSonarReports('api');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/api/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should move web unit report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('test-report.xml');
      });

      // Act
      const result = moveSonarReports('web-unit');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/web/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should move web snapshot report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('test-report.xml');
      });

      // Act
      const result = moveSonarReports('web-snapshot');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/web/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should handle missing source file', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      const result = moveSonarReports('api');

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Source file not found'));
    });

    it('should handle invalid report type', () => {
      // Act
      const result = moveSonarReports('invalid');

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Invalid report type'));
    });

    it('should handle file operation errors', () => {
      // Arrange
      mockExistsSync.mockReturnValue(true);
      mockCopyFileSync.mockImplementation(() => {
        throw new Error('Copy failed');
      });

      // Act
      const result = moveSonarReports('api');

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error moving file'));
    });
  });
});

describe('main', () => {
  beforeEach(() => {
    setupMockDefaults();
    // Reset process.argv
    process.argv = ['node', 'coverage.js'];
  });

  it('executes clean command when type is none and clean flag is true', () => {
    // Arrange
    const argv = {
      type: 'none',
      clean: true,
    };

    // Act
    main(argv);

    // Assert
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Cleaning coverage directories')
    );
    expect(mockExecSync).toHaveBeenCalledWith('rm -rf coverage', {
      stdio: 'inherit',
    });
  });

  it('runs unit tests with coverage when type is unit', () => {
    // Arrange
    const argv = {
      type: 'unit',
      clean: true,
    };

    // Act
    main(argv);

    // Assert
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Cleaning coverage directories')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Running unit tests'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Running API unit tests'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Running Web unit tests'));
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Combining coverage reports')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Coverage operation completed successfully')
    );
  });
});
