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
import path from 'node:path';
import fs from 'fs';
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
  mockParseFromString,
  mockSerializeToString,
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
      mockExistsSync.mockReturnValue(true);

      // Act
      openReports();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Opening coverage reports')
      );

      // Should call execSync with open command for all reports
      expect(mockExecSync).toHaveBeenCalledWith(
        'open coverage/api/unit/lcov-report/index.html coverage/web/unit/lcov-report/index.html coverage/web/snapshot/lcov-report/index.html coverage/combined/lcov-report/index.html',
        expect.any(Object)
      );
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

      // Mock the existence of the coverage reports
      mockReadFileSync.mockImplementation(path => {
        if (path.includes('lcov.info')) {
          return 'SF:file.js\nLF:10\nLH:5\nend_of_record';
        }
        return '';
      });

      // Act
      generateReport();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Generating coverage report')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Coverage Summary'));
    });

    it('generates detailed coverage report', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => {
        return path.includes('lcov.info') || path.includes('coverage-final.json');
      });

      const mockCoverageData = {
        'src/file1.js': {
          s: { 0: 1, 1: 0, 2: 1 },
          statementMap: {},
          fnMap: {},
          branchMap: {},
        },
        'src/file2.js': {
          s: { 0: 1, 1: 1, 2: 1 },
          statementMap: {},
          fnMap: {},
          branchMap: {},
        },
      };

      mockReadFileSync.mockImplementation(path => {
        if (path.includes('coverage-final.json')) {
          return JSON.stringify(mockCoverageData);
        }
        if (path.includes('lcov.info')) {
          return 'SF:file.js\nLF:10\nLH:5\nend_of_record';
        }
        return '';
      });

      // Act
      generateReport(true);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Generating coverage report')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('src/file1.js'));
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Statements: 2/3 (66.67%)')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('src/file2.js'));
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Statements: 3/3 (100.00%)')
      );
    });
  });

  describe('combineCoverage', () => {
    it('combines LCOV files from all coverage directories', () => {
      // Arrange
      const mockLcovContent1 = 'TN:\nSF:src/file1.js\nFNF:1\nFNH:1\nLF:1\nLH:1\nend_of_record\n';
      const mockLcovContent2 = 'TN:\nSF:src/file2.js\nFNF:2\nFNH:2\nLF:2\nLH:2\nend_of_record\n';
      const mockSonarXml = '<?xml version="1.0" encoding="UTF-8"?><coverage></coverage>';

      mockExistsSync.mockImplementation(path => {
        if (path.includes('coverage/api/unit') || path.includes('coverage/web/unit')) return true;
        if (path.includes('lcov.info')) return true;
        if (path.includes('sonar-report.xml')) return true;
        return false;
      });

      mockReadFileSync.mockImplementation(path => {
        if (path.includes('coverage/api/unit/lcov.info')) return mockLcovContent1;
        if (path.includes('coverage/web/unit/lcov.info')) return mockLcovContent2;
        if (path.includes('sonar-report.xml')) return mockSonarXml;
        return '';
      });

      // Act
      combineCoverage();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Combining coverage reports')
      );

      // Check LCOV file combination
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'coverage/combined/lcov.info',
        mockLcovContent1 + '\n' + mockLcovContent2 + '\n'
      );

      // Check Sonar XML handling
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'coverage/combined/sonar-report.xml',
        expect.any(String)
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Combined Sonar report created')
      );
    });
  });

  describe('runSnapshotTests', () => {
    it('runs snapshot tests with coverage', () => {
      // Act
      runSnapshotTests();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Running snapshot tests')
      );

      // Verify snapshot test command
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('npm run test --workspace=apps/web -- --testPathPattern=snapshot'),
        { stdio: 'inherit' }
      );
    });
  });

  describe('runUnitTests', () => {
    it('runs unit tests for API and Web with coverage', () => {
      // Act
      runUnitTests();

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Running unit tests'));
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Running API unit tests')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Running Web unit tests')
      );

      // Verify API test command
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('npm run test --workspace=apps/api'),
        { stdio: 'inherit' }
      );

      // Verify Web test command
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('npm run test --workspace=apps/web'),
        { stdio: 'inherit' }
      );
    });
  });

  describe('cleanCoverage', () => {
    it('cleans coverage directories', () => {
      // Act
      cleanCoverage();

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith('rm -rf coverage', {
        stdio: 'inherit',
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Cleaning coverage directories')
      );
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
      mockExistsSync.mockImplementation(path => path.includes('apps/api/test-report.xml'));

      // Act
      const result = moveSonarReports('api');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/api/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Moved file'));
    });

    it('should move web unit report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => path.includes('apps/web/test-report.xml'));

      // Act
      const result = moveSonarReports('web-unit');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/web/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Moved file'));
    });

    it('should move web snapshot report correctly', () => {
      // Arrange
      mockExistsSync.mockImplementation(path => path.includes('apps/web/test-report.xml'));

      // Act
      const result = moveSonarReports('web-snapshot');

      // Assert
      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('apps/web/test-report.xml')
      );
      expect(mockCopyFileSync).toHaveBeenCalled();
      expect(mockUnlinkSync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Moved file'));
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
        throw new Error('Mock file operation error');
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

  it('executes clean command when type is none and clean flag is true', async () => {
    // Arrange
    process.argv = ['node', 'coverage.js', '--type=none', '--clean'];
    mockExistsSync.mockReturnValue(false);

    // Act
    await main();

    // Assert
    expect(mockConsoleLog).toHaveBeenCalledWith('🧹 Cleaning coverage directories...');
    expect(mockConsoleLog).toHaveBeenCalledWith('✨ Coverage operation completed successfully!');
    expect(mockExecSync).toHaveBeenCalledWith('rm -rf coverage', {
      stdio: 'inherit',
    });
  });

  it('runs unit tests with coverage when type is unit', async () => {
    // Arrange
    process.argv = ['node', 'coverage.js', '--type=unit'];
    mockExistsSync.mockReturnValue(false);

    // Act
    await main();

    // Assert
    expect(mockConsoleLog).toHaveBeenCalledWith('🧪 Running unit tests...');
    expect(mockConsoleLog).toHaveBeenCalledWith('Running API unit tests...');
    expect(mockConsoleLog).toHaveBeenCalledWith('Running Web unit tests...');
    expect(mockConsoleLog).toHaveBeenCalledWith('🔄 Combining coverage reports...');
    expect(mockConsoleLog).toHaveBeenCalledWith('✨ Coverage operation completed successfully!');

    // Verify directories were created
    expect(mockMkdirSync).toHaveBeenCalledWith('coverage/api/unit', {
      recursive: true,
    });
    expect(mockMkdirSync).toHaveBeenCalledWith('coverage/web/unit', {
      recursive: true,
    });

    // Verify tests were run
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('npm run test --workspace=apps/api'),
      { stdio: 'inherit' }
    );
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('npm run test --workspace=apps/web'),
      { stdio: 'inherit' }
    );
  });
});
