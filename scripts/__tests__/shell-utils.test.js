import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { setupTestEnvironment } from './test-utils.js';

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    HOME: '/home/test',
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

// Mock fs module
jest.mock('node:fs', () => ({
  readFileSync: jest.fn().mockReturnValue('20\n'),
  existsSync: jest.fn().mockImplementation((path) => {
    // Return true for .nvmrc and $HOME/.nvm/nvm.sh
    if (path === '.nvmrc' || path === '/home/test/.nvm/nvm.sh') {
      return true;
    }
    return false;
  }),
  readdirSync: jest.fn(),
}));

// Mock execSync to simulate successful version switching
const mockExecSync = jest.fn().mockImplementation((command) => {
  if (command === 'node -v') {
    return 'v20.0.0';
  }
  if (command === 'brew --prefix nvm') {
    return '/usr/local/opt/nvm';
  }
  if (command.includes('source') && command.includes('nvm use')) {
    return '';
  }
  return '';
});

jest.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));

// Set up test environment
const { mockExit, mockConsoleLog, mockConsoleError } = setupTestEnvironment();

// Import functions
import {
  switchNodeVersion,
  getCurrentNodeVersion,
  exec,
  getRequiredNodeVersion,
} from '../lib/shell-utils.js';

describe('shell-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('switchNodeVersion', () => {
    it('switches to the required Node.js version', () => {
      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      // Verify that the function completed successfully
      expect(mockExit).not.toHaveBeenCalled();

      // Verify that we got a success message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Successfully switched to Node.js')
      );

      // Verify that we're using the correct version
      expect(mockExecSync).toHaveBeenCalledWith('node -v', expect.any(Object));
    });

    it('exits with error when nvm is not available', () => {
      // Arrange
      const { existsSync } = jest.requireMock('node:fs');
      existsSync.mockImplementation(() => false);
      mockExecSync.mockImplementation(() => {
        throw new Error('brew not found');
      });

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Could not find nvm')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('exits with error when Node.js version switch fails', () => {
      // Arrange
      mockExecSync.mockImplementation((command) => {
        if (command === 'node -v') {
          return 'v20.0.0';
        }
        if (command === 'brew --prefix nvm') {
          return '/usr/local/opt/nvm';
        }
        if (command.includes('source') && command.includes('nvm use')) {
          throw new Error('Failed to switch Node.js version');
        }
        return '';
      });

      // Act
      switchNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to switch Node.js version')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('getCurrentNodeVersion', () => {
    it('returns the current Node.js version', () => {
      // Arrange
      mockExecSync.mockImplementation((command) => {
        if (command === 'node -v') {
          return 'v18.15.0';
        }
        return '';
      });

      // Act
      const version = getCurrentNodeVersion(mockExecSync);

      // Assert
      expect(version).toBe('18');
      expect(mockExecSync).toHaveBeenCalledWith('node -v', expect.any(Object));
    });
  });

  describe('exec', () => {
    it('executes command with default options', () => {
      // Arrange
      const command = 'echo "hello"';
      mockExecSync.mockReturnValue('hello\n');

      // Act
      const result = exec(mockExecSync, command);

      // Assert
      expect(result).toBe('hello\n');
      expect(mockExecSync).toHaveBeenCalledWith(command, {
        stdio: 'inherit',
        encoding: 'utf-8',
      });
    });
  });

  describe('getRequiredNodeVersion', () => {
    it('returns the Node.js version from .nvmrc', () => {
      // Act
      const version = getRequiredNodeVersion();

      // Assert
      expect(version).toBe('20');
    });
  });
});
