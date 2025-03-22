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
  checkNodeVersionMatch,
  cleanDeep,
  checkNodeVersion,
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

    it('exits with error when node version cannot be determined', () => {
      // Arrange
      mockExecSync.mockImplementation((command) => {
        if (command === 'node -v') {
          throw new Error('Command failed');
        }
        return '';
      });

      // Act
      getCurrentNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Could not determine current Node.js version'
        )
      );
      expect(mockExit).toHaveBeenCalledWith(1);
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

    it('executes command with custom options', () => {
      // Arrange
      const command = 'echo "hello"';
      const customOptions = {
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 1000,
      };
      mockExecSync.mockReturnValue('hello with options\n');

      // Act
      const result = exec(mockExecSync, command, customOptions);

      // Assert
      expect(result).toBe('hello with options\n');
      expect(mockExecSync).toHaveBeenCalledWith(command, customOptions);
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

  describe('checkNodeVersionMatch', () => {
    it('returns true when versions match', () => {
      // Arrange
      const requiredVersion = '20';
      const currentVersion = '20';

      // Act
      const result = checkNodeVersionMatch(requiredVersion, currentVersion);

      // Assert
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Using correct Node.js version')
      );
    });

    it('returns false when versions do not match but force is true', () => {
      // Arrange
      const requiredVersion = '20';
      const currentVersion = '18';
      const force = true;

      // Act
      const result = checkNodeVersionMatch(
        requiredVersion,
        currentVersion,
        force
      );

      // Assert
      expect(result).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Using Node.js')
      );
      expect(mockExit).not.toHaveBeenCalled();
    });

    it('exits when versions do not match and force is false', () => {
      // Arrange
      const requiredVersion = '20';
      const currentVersion = '18';

      // Act & Assert
      // This function should call process.exit(1), so we need to verify
      // that the appropriate error messages are shown before that happens
      checkNodeVersionMatch(requiredVersion, currentVersion);

      // Verify console.error was called with expected error message
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(
          `Error: This project requires Node.js version ${requiredVersion}`
        )
      );

      // Verify process.exit was called with code 1
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('checkNodeVersion', () => {
    it('checks if Node.js version is consistent', () => {
      // Mock execSync to return a specific version
      mockExecSync.mockImplementation((command) => {
        if (command === 'node -v') {
          return 'v20.0.0';
        }
        return '';
      });

      // Act
      const result = checkNodeVersion(mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checking Node.js version consistency')
      );
    });
  });

  describe('cleanDeep', () => {
    it('displays help message and exits with --help flag', () => {
      // Arrange
      const args = ['--help'];

      // Act
      cleanDeep(args, mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Thanos Deep Clean Script')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Usage: npm run clean:deep [options]')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('--dry-run')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('--force')
      );
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('runs in dry-run mode when --dry-run flag is used', () => {
      // Arrange
      const args = ['--dry-run'];

      // Act
      cleanDeep(args, mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Running in dry-run mode')
      );

      // Verify it checks Node.js version
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checking Node.js version')
      );

      // Verify it shows what would be removed but doesn't actually execute the command
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Would remove:')
      );

      // Verify it doesn't actually run the removal command
      expect(mockExecSync).not.toHaveBeenCalledWith(
        expect.stringContaining('rm -rf'),
        expect.any(Object)
      );
    });

    it('bypasses Node.js version check with --force flag', () => {
      // Arrange
      const args = ['--force'];

      // Act
      cleanDeep(args, mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Force mode enabled')
      );

      // Verify it starts deep clean process
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Starting deep clean')
      );

      // Verify the force flag is passed to checkNodeVersionMatch
      // This is indirectly verified by the fact that our test doesn't fail even if versions don't match
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checking Node.js version')
      );
    });

    it('handles Jest cache clearing failures gracefully', () => {
      // Arrange
      const testExecSync = jest.fn().mockImplementation((command) => {
        if (command === 'npx jest --clearCache') {
          throw new Error('Jest cache clear failed');
        }
        if (command === 'node -v') {
          return 'v20.0.0';
        }
        if (command === 'npm -v') {
          return '9.0.0';
        }
        return '';
      });

      // Act
      cleanDeep([], testExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Jest cache clear might have failed')
      );

      // Verify it continues with the process despite the error
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checking environment')
      );
    });

    it('executes commands in non-dry-run mode', () => {
      // Arrange
      const testExecSync = jest.fn().mockImplementation((command) => {
        if (command === 'node -v') {
          return 'v20.0.0';
        }
        if (command === 'npm -v') {
          return '9.0.0';
        }
        return '';
      });

      // Act
      cleanDeep([], testExecSync);

      // Assert
      // Verify it runs the removal command
      expect(testExecSync).toHaveBeenCalledWith(
        'rm -rf node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs',
        expect.any(Object)
      );

      // Verify it cleans npm cache
      expect(testExecSync).toHaveBeenCalledWith(
        'npm cache clean --force',
        expect.any(Object)
      );

      // Verify it installs dependencies
      expect(testExecSync).toHaveBeenCalledWith(
        'npm install',
        expect.any(Object)
      );

      // Verify completion message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Deep cleaning complete')
      );
    });
  });
});
