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
    it('switches to the required Node.js version', () => {
      // Arrange
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('20.0.0\n');
      mockExecSync.mockImplementation(cmd => {
        if (cmd.includes('nvm use')) return 'Now using Node.js v20.0.0';
        return '';
      });

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('nvm use'),
        expect.any(Object)
      );
    });

    it('exits with error when nvm is not available', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Could not find nvm'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('exits with error when Node.js version switch fails', () => {
      // Arrange
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('Failed to switch version');
      });

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalled();
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
    it('returns the Node.js version from package.json', () => {
      // Arrange
      mockReadFileSync.mockReturnValue(JSON.stringify({ engines: { node: '20.0.0' } }));

      // Act
      const version = getRequiredNodeVersion();

      // Assert
      expect(version).toBe('20.0.0');
      expect(mockReadFileSync).toHaveBeenCalledWith('package.json', 'utf-8');
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
      mockReadFileSync.mockReturnValue(JSON.stringify({ engines: { node: '20.0.0' } }));

      // Act
      checkNodeVersion(mockExecSync);

      // Assert
      expect(mockReadFileSync).toHaveBeenCalledWith('package.json', 'utf-8');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checking Node.js version consistency')
      );
    });
  });

  describe('cleanDeep', () => {
    it('performs deep clean with default options', () => {
      // Arrange
      const mockExecSync = vi.fn();

      // Act
      cleanDeep({ execSync: mockExecSync });

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith('rm -rf node_modules', expect.any(Object));
      expect(mockExecSync).toHaveBeenCalledWith('rm -rf dist tmp coverage', expect.any(Object));
      expect(mockExecSync).toHaveBeenCalledWith('npm cache clean --force', expect.any(Object));
    });

    it('handles dry run mode', () => {
      // Arrange
      const mockExecSync = vi.fn();
      const mockConsole = { log: vi.fn() };

      // Act
      cleanDeep({ execSync: mockExecSync, console: mockConsole, dryRun: true });

      // Assert
      expect(mockExecSync).not.toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith('Would run: rm -rf node_modules');
      expect(mockConsole.log).toHaveBeenCalledWith('Would run: rm -rf dist tmp coverage');
      expect(mockConsole.log).toHaveBeenCalledWith('Would run: npm cache clean --force');
    });
  });
});
