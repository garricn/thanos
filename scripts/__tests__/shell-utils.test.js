import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockExecSync,
  mockReadFileSync,
  mockExistsSync,
  mockConsoleLog,
  mockConsoleError,
  mockExit,
  setupMockDefaults,
} from './test-utils.js';
import {
  switchNodeVersion,
  getCurrentNodeVersion,
  exec,
  getRequiredNodeVersion,
  checkNodeVersionMatch,
  checkNodeVersion,
  cleanDeep,
} from '../lib/shell-utils.js';

describe('shell-utils', () => {
  beforeEach(() => {
    setupMockDefaults();
    // Clear specific mocks for these tests
    mockExecSync.mockClear();
    mockReadFileSync.mockClear();
    mockExistsSync.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockExit.mockClear();
  });

  describe('switchNodeVersion', () => {
    it('returns early if already using correct version', () => {
      // Arrange
      mockReadFileSync.mockReturnValue('20\n');
      mockExecSync.mockReturnValue('v20.0.0');

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Already using Node.js v20')
      );
      expect(mockExit).not.toHaveBeenCalled();
    });

    it('prints error and exits when version mismatch', () => {
      // Arrange
      mockReadFileSync.mockReturnValue('20\n');
      mockExecSync.mockReturnValue('v22.0.0');

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Could not find nvm')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('exits with error when node version cannot be determined', () => {
      // Arrange
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('Failed to get version');
      });

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Could not determine current Node.js version')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('getCurrentNodeVersion', () => {
    it('returns the current Node.js version', () => {
      // Arrange
      mockExecSync.mockReturnValue('v20.0.0');

      // Act
      const version = getCurrentNodeVersion(mockExecSync);

      // Assert
      expect(version).toBe('20');
      expect(mockExecSync).toHaveBeenCalledWith('node -v', {
        stdio: 'pipe',
        encoding: 'utf-8',
      });
    });

    it('exits with error when node version cannot be determined', () => {
      // Arrange
      mockExecSync.mockImplementation(() => {
        throw new Error('Failed to get version');
      });

      // Act
      getCurrentNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Could not determine current Node.js version')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('exec', () => {
    it('executes command with default options', () => {
      // Arrange
      mockExecSync.mockReturnValue('command output');

      // Act
      const output = exec(mockExecSync, 'test command');

      // Assert
      expect(output).toBe('command output');
      expect(mockExecSync).toHaveBeenCalledWith('test command', {
        stdio: 'inherit',
        encoding: 'utf-8',
      });
    });

    it('executes command with custom options', () => {
      // Arrange
      mockExecSync.mockReturnValue('command output');

      // Act
      const output = exec(mockExecSync, 'test command', { stdio: 'pipe' });

      // Assert
      expect(output).toBe('command output');
      expect(mockExecSync).toHaveBeenCalledWith('test command', {
        stdio: 'pipe',
        encoding: 'utf-8',
      });
    });
  });

  describe('getRequiredNodeVersion', () => {
    it('returns the Node.js version from .nvmrc', () => {
      // Arrange
      mockReadFileSync.mockReturnValue('20.0.0\n');

      // Act
      const version = getRequiredNodeVersion();

      // Assert
      expect(version).toBe('20.0.0');
      expect(mockReadFileSync).toHaveBeenCalledWith('.nvmrc', 'utf-8');
    });
  });

  describe('checkNodeVersionMatch', () => {
    it('returns true when versions match', () => {
      // Act
      const result = checkNodeVersionMatch('20.0.0', '20.0.0');

      // Assert
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Using correct Node.js version')
      );
    });

    it('returns false when versions do not match but force is true', () => {
      // Act
      const result = checkNodeVersionMatch('20.0.0', '18.0.0', true);

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Using Node.js')
      );
    });

    it('exits when versions do not match and force is false', () => {
      // Act
      checkNodeVersionMatch('20.0.0', '18.0.0');

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('This project requires Node.js version 20.0.0')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('checkNodeVersion', () => {
    it('checks if Node.js version is consistent', () => {
      // Arrange
      mockReadFileSync.mockImplementation((path) => {
        if (path === '.nvmrc') return '20.0.0\n';
        if (path === 'package.json')
          return JSON.stringify({ engines: { node: '20.0.0' } });
        return '';
      });

      // Act
      checkNodeVersion(mockExecSync);

      // Assert
      expect(mockReadFileSync).toHaveBeenCalledWith('.nvmrc', 'utf-8');
      expect(mockReadFileSync).toHaveBeenCalledWith('package.json', 'utf-8');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checking Node.js version consistency')
      );
    });
  });

  describe('cleanDeep', () => {
    it('displays help message and exits with --help flag', () => {
      // Act
      cleanDeep(['--help'], mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Thanos Deep Clean Script')
      );
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('runs in dry-run mode when --dry-run flag is used', () => {
      // Act
      cleanDeep(['--dry-run'], mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Running in dry-run mode')
      );
      // Should show "Would remove" instead of actually removing
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Would remove:')
      );
      // Should not execute rm command
      expect(mockExecSync).not.toHaveBeenCalledWith(
        expect.stringContaining('rm -rf node_modules'),
        expect.any(Object)
      );
    });

    it('bypasses Node.js version check with --force flag', () => {
      // Arrange - setup different versions
      mockReadFileSync.mockReturnValue('20.0.0\n'); // .nvmrc
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'node -v') return 'v18.0.0'; // Current version
        return '';
      });

      // Act
      cleanDeep(['--force'], mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Force mode enabled')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Using Node.js v18')
      );
      // Should continue with cleaning despite version mismatch
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('rm -rf'),
        expect.any(Object)
      );
    });

    it('removes generated files and cleans npm cache', () => {
      // Arrange
      mockReadFileSync.mockReturnValue('20.0.0\n');
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'node -v') return 'v20.0.0';
        if (cmd === 'npm -v') return '9.0.0';
        return '';
      });

      // Act
      cleanDeep([], mockExecSync);

      // Assert
      // Should execute rm command
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('rm -rf node_modules'),
        expect.any(Object)
      );
      // Should clean npm cache
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm cache clean --force',
        expect.any(Object)
      );
      // Should clear Jest cache
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx jest --clearCache',
        expect.any(Object)
      );
      // Should reinstall dependencies
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm install',
        expect.any(Object)
      );
      // Should show completion message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Deep cleaning complete')
      );
    });

    it('handles Jest cache clear failure gracefully', () => {
      // Arrange
      mockReadFileSync.mockReturnValue('20.0.0\n');
      mockExecSync.mockImplementation((cmd, opts) => {
        if (cmd === 'node -v') return 'v20.0.0';
        if (cmd === 'npm -v') return '9.0.0';
        if (cmd === 'npx jest --clearCache') {
          throw new Error('Jest not installed');
        }
        return '';
      });

      // Act
      cleanDeep([], mockExecSync);

      // Assert
      // Should continue despite Jest cache clear failure
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Jest cache clear might have failed')
      );
      // Should still reinstall dependencies
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm install',
        expect.any(Object)
      );
    });
  });
});
