import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  setupCommonMocks,
  setupTestEnvironment,
  createVersionState,
  createCleanState,
  expectSuccessMessage,
  expectErrorMessage,
  expectWarningMessage,
} from './test-utils.js';

// Set up common mocks
const { mockExecSync, mockReadFileSync, mockExistsSync, mockReaddirSync } =
  setupCommonMocks();

// Import after mocking
const shellUtils = (await import('../lib/shell-utils.js')).default;

// Set up test environment
const { mockExit, mockConsoleLog, mockConsoleError } = setupTestEnvironment();

describe('shell-utils', () => {
  beforeEach(() => {
    mockExecSync.mockClear();
    mockReadFileSync.mockClear();
    mockExistsSync.mockClear();
    mockReaddirSync.mockClear();
    mockExit.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe('version management', () => {
    it('should pass when Node.js version matches', () => {
      const state = createVersionState();
      mockReadFileSync.mockReturnValue(state.requiredVersion);
      mockExecSync.mockReturnValue(`v${state.currentVersion}.0.0`);

      const result = shellUtils.checkNodeVersionMatch(
        state.requiredVersion,
        state.currentVersion,
        state.force
      );

      expect(result).toBe(true);
      expectSuccessMessage(
        mockConsoleLog,
        `Using correct Node.js version: v${state.currentVersion}`
      );
    });

    it('should fail when Node.js version does not match', () => {
      const state = createVersionState({
        currentVersion: '16',
      });
      mockReadFileSync.mockReturnValue(state.requiredVersion);
      mockExecSync.mockReturnValue(`v${state.currentVersion}.0.0`);

      shellUtils.checkNodeVersionMatch(
        state.requiredVersion,
        state.currentVersion,
        state.force
      );

      expectErrorMessage(
        mockConsoleError,
        `This project requires Node.js version ${state.requiredVersion}`
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should warn but continue when force flag is used', () => {
      const state = createVersionState({
        currentVersion: '16',
        force: true,
      });
      mockReadFileSync.mockReturnValue(state.requiredVersion);
      mockExecSync.mockReturnValue(`v${state.currentVersion}.0.0`);

      const result = shellUtils.checkNodeVersionMatch(
        state.requiredVersion,
        state.currentVersion,
        state.force
      );

      expect(result).toBe(false);
      expectWarningMessage(
        mockConsoleLog,
        `Warning: Using Node.js v${state.currentVersion}`
      );
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('clean operations', () => {
    it('should perform a full clean when no options provided', () => {
      const state = createCleanState();
      mockExecSync
        .mockReturnValueOnce(`v${state.nodeVersion}.0.0`) // node -v
        .mockReturnValueOnce('') // rm -rf
        .mockReturnValueOnce('') // npm cache clean
        .mockReturnValueOnce('') // jest cache clear
        .mockReturnValueOnce('') // npm install
        .mockReturnValue(`v${state.nodeVersion}.0.0`); // final node -v

      shellUtils.cleanDeep([], mockExecSync);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🧹 Starting deep clean')
      );
      expectSuccessMessage(
        mockConsoleLog,
        'Removed generated files and directories'
      );
      expectSuccessMessage(mockConsoleLog, 'Cleaned npm cache');
      expectSuccessMessage(mockConsoleLog, 'Cleared Jest cache');
      expectSuccessMessage(mockConsoleLog, 'Installed dependencies');
    });

    it('should show what would be done in dry run mode', () => {
      const state = createCleanState({ dryRun: true });
      mockExecSync.mockReturnValue(`v${state.nodeVersion}.0.0`);

      shellUtils.cleanDeep(['--dry-run'], mockExecSync);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Running in dry-run mode')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(
          'Would remove: node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs'
        )
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Would run: npm cache clean --force')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Would run: npx jest --clearCache')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Would run: npm install')
      );
      expect(mockExecSync).toHaveBeenCalledTimes(2); // Only node -v and npm -v
    });

    it('should bypass version check in force mode', () => {
      const state = createCleanState({
        nodeVersion: '16',
        force: true,
      });
      mockExecSync
        .mockReturnValueOnce(`v${state.nodeVersion}.0.0`) // node -v
        .mockReturnValueOnce('') // rm -rf
        .mockReturnValueOnce('') // npm cache clean
        .mockReturnValueOnce('') // jest cache clear
        .mockReturnValueOnce('') // npm install
        .mockReturnValue(`v${state.nodeVersion}.0.0`); // final node -v

      shellUtils.cleanDeep(['--force'], mockExecSync);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Force mode enabled')
      );
      expectSuccessMessage(
        mockConsoleLog,
        'Removed generated files and directories'
      );
    });

    it('should handle Jest cache clear failure gracefully', () => {
      const state = createCleanState({ jestCache: false });
      mockExecSync
        .mockReturnValueOnce(`v${state.nodeVersion}.0.0`) // node -v
        .mockReturnValueOnce('') // rm -rf
        .mockReturnValueOnce('') // npm cache clean
        .mockImplementationOnce(() => {
          throw new Error('Command not found: jest');
        }) // jest cache clear
        .mockReturnValueOnce('') // npm install
        .mockReturnValue(`v${state.nodeVersion}.0.0`); // final node -v

      shellUtils.cleanDeep([], mockExecSync);

      expectWarningMessage(
        mockConsoleLog,
        'Jest cache clear might have failed'
      );
      expectSuccessMessage(mockConsoleLog, 'Installed dependencies');
    });
  });

  describe('exec', () => {
    it('executes command with default options', () => {
      const command = 'test command';
      mockExecSync.mockReturnValue('test output');

      const result = shellUtils.exec(mockExecSync, command);

      expect(mockExecSync).toHaveBeenCalledWith(command, {
        stdio: 'inherit',
        encoding: 'utf-8',
      });
      expect(result).toBe('test output');
    });

    it('executes command with custom options', () => {
      const command = 'test command';
      const options = { stdio: 'pipe', encoding: 'ascii' };
      mockExecSync.mockReturnValue('test output');

      const result = shellUtils.exec(mockExecSync, command, options);

      expect(mockExecSync).toHaveBeenCalledWith(command, options);
      expect(result).toBe('test output');
    });

    it('passes through execSync errors', () => {
      const command = 'failing command';
      const error = new Error('Command failed');
      mockExecSync.mockImplementation(() => {
        throw error;
      });

      expect(() => shellUtils.exec(mockExecSync, command)).toThrow(error);
    });
  });

  describe('version management', () => {
    describe('getRequiredNodeVersion', () => {
      it('reads version from .nvmrc', () => {
        mockReadFileSync.mockReturnValue('18\n');
        const version = shellUtils.getRequiredNodeVersion();
        expect(mockReadFileSync).toHaveBeenCalledWith('.nvmrc', 'utf-8');
        expect(version).toBe('18');
      });

      it('exits with error if .nvmrc is not found', () => {
        mockReadFileSync.mockImplementation(() => {
          throw new Error('File not found');
        });

        shellUtils.getRequiredNodeVersion();

        expect(mockConsoleError).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[31mError: Could not read .nvmrc file.\x1b[0m'
          )
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      });
    });

    describe('getCurrentNodeVersion', () => {
      it('extracts major version from node -v output', () => {
        mockExecSync.mockReturnValue('v18.17.0\n');
        const version = shellUtils.getCurrentNodeVersion(mockExecSync);
        expect(version).toBe('18');
        expect(mockExecSync).toHaveBeenCalledWith('node -v', {
          stdio: 'pipe',
          encoding: 'utf-8',
        });
      });

      it('exits with error if version check fails', () => {
        mockExecSync.mockImplementation(() => {
          throw new Error('Command failed');
        });

        shellUtils.getCurrentNodeVersion(mockExecSync);

        expect(mockConsoleError).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[31mError: Could not determine current Node.js version.\x1b[0m'
          )
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      });
    });

    describe('checkNodeVersionMatch', () => {
      it('returns true when versions match', () => {
        const result = shellUtils.checkNodeVersionMatch('18', '18');
        expect(result).toBe(true);
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[32m✓ Using correct Node.js version: v18\x1b[0m'
          )
        );
      });

      it('exits when versions do not match and force is false', () => {
        shellUtils.checkNodeVersionMatch('18', '16');

        expect(mockConsoleError).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[31mError: This project requires Node.js version 18'
          )
        );
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('npm run fix-node-version')
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      });

      it('returns false and warns when versions do not match but force is true', () => {
        const result = shellUtils.checkNodeVersionMatch('18', '16', true);

        expect(result).toBe(false);
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('\x1b[33m⚠️ Warning: Using Node.js v16')
        );
        expect(mockExit).not.toHaveBeenCalled();
      });
    });
  });

  describe('cleanDeep', () => {
    beforeEach(() => {
      mockExecSync.mockReturnValue('v18.0.0');
    });

    it('shows help message and exits when --help is provided', () => {
      shellUtils.cleanDeep(['--help'], mockExecSync);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Thanos Deep Clean Script')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Usage: npm run clean:deep [options]')
      );
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('performs dry run when --dry-run is provided', () => {
      shellUtils.cleanDeep(['--dry-run'], mockExecSync);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Running in dry-run mode')
      );
      expect(mockExecSync).not.toHaveBeenCalledWith(
        'rm -rf node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs',
        expect.any(Object)
      );
    });

    it('bypasses version check when --force is provided', () => {
      mockExecSync
        .mockReturnValueOnce('v16.0.0') // node -v
        .mockReturnValueOnce('') // npm cache clean
        .mockReturnValueOnce(''); // jest cache clear

      shellUtils.cleanDeep(['--force'], mockExecSync);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Force mode enabled')
      );
    });

    it('performs full clean in normal mode', () => {
      mockExecSync
        .mockReturnValueOnce('v18.0.0') // node -v
        .mockReturnValueOnce('') // rm -rf
        .mockReturnValueOnce('') // npm cache clean
        .mockReturnValueOnce('') // jest cache clear
        .mockReturnValueOnce('') // npm install
        .mockReturnValue('v18.0.0'); // final node -v

      shellUtils.cleanDeep([], mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'rm -rf node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs',
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm cache clean --force',
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx jest --clearCache',
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm install',
        expect.any(Object)
      );
    });

    it('continues if Jest cache clear fails', () => {
      mockExecSync
        .mockReturnValueOnce('v18.0.0') // node -v
        .mockReturnValueOnce('') // rm -rf
        .mockReturnValueOnce('') // npm cache clean
        .mockImplementationOnce(() => {
          const error = new Error('Command not found: jest');
          error.stderr = 'Command not found: jest';
          throw error;
        }) // jest cache clear
        .mockReturnValueOnce('') // npm install
        .mockReturnValue('v18.0.0'); // final node -v

      shellUtils.cleanDeep([], mockExecSync);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Jest cache clear might have failed')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Deep cleaning complete')
      );
    });
  });

  describe('checkNodeVersion', () => {
    beforeEach(() => {
      mockExecSync.mockReturnValue('v18.0.0');
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['ci.yml']);
      mockReadFileSync.mockReset();
      mockConsoleLog.mockClear();
      mockConsoleError.mockClear();
    });

    it('verifies package.json node version matches .nvmrc', () => {
      mockReadFileSync
        .mockReturnValueOnce('18\n') // .nvmrc
        .mockReturnValueOnce(JSON.stringify({ engines: { node: '18' } })) // package.json
        .mockReturnValueOnce('node-version: 18\n'); // workflow file

      shellUtils.checkNodeVersion(mockExecSync);

      const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
      expect(calls).toEqual([
        '\x1b[33mChecking Node.js version consistency...\x1b[0m',
        '\n\x1b[33mChecking package.json...\x1b[0m',
        '\x1b[32m✅ package.json Node.js version matches .nvmrc\x1b[0m',
        '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
        '\x1b[32m✅ ci.yml Node.js version matches .nvmrc\x1b[0m',
        '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
      ]);
    });

    it('exits when package.json is missing engines field', () => {
      mockReadFileSync
        .mockReturnValueOnce('18\n') // .nvmrc
        .mockReturnValueOnce('{}') // package.json
        .mockReturnValueOnce(''); // workflow file

      shellUtils.checkNodeVersion(mockExecSync);

      const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
      expect(calls).toEqual([
        '\x1b[33mChecking Node.js version consistency...\x1b[0m',
        '\n\x1b[33mChecking package.json...\x1b[0m',
        '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
        '\x1b[33mℹ️ ci.yml does not specify a Node.js version directly. Skipping check.\x1b[0m',
        '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
      ]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '\x1b[31m❌ Error: No Node.js version specified in package.json engines field\x1b[0m'
      );
    });

    it('exits when package.json node version does not match .nvmrc', () => {
      mockReadFileSync
        .mockReturnValueOnce('18\n') // .nvmrc
        .mockReturnValueOnce(JSON.stringify({ engines: { node: '16' } })) // package.json
        .mockReturnValueOnce(''); // workflow file

      shellUtils.checkNodeVersion(mockExecSync);

      const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
      expect(calls).toEqual([
        '\x1b[33mChecking Node.js version consistency...\x1b[0m',
        '\n\x1b[33mChecking package.json...\x1b[0m',
        '\x1b[33m    Please update package.json to use version from .nvmrc\x1b[0m',
        '\x1b[32m✅ package.json Node.js version matches .nvmrc\x1b[0m',
        '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
        '\x1b[33mℹ️ ci.yml does not specify a Node.js version directly. Skipping check.\x1b[0m',
        '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
      ]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '\x1b[31m❌ Error: Node.js version in package.json (16) does not match .nvmrc (18)\x1b[0m'
      );
    });

    it('exits when package.json cannot be read', () => {
      const error = new Error('ENOENT: no such file or directory');
      mockReadFileSync
        .mockReturnValueOnce('18\n') // .nvmrc
        .mockImplementationOnce(() => {
          throw error;
        }) // package.json
        .mockReturnValueOnce(''); // workflow file

      shellUtils.checkNodeVersion(mockExecSync);

      const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
      expect(calls).toEqual([
        '\x1b[33mChecking Node.js version consistency...\x1b[0m',
        '\n\x1b[33mChecking package.json...\x1b[0m',
        '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
        '\x1b[33mℹ️ ci.yml does not specify a Node.js version directly. Skipping check.\x1b[0m',
        '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
      ]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        `\x1b[31m❌ Error: Could not read package.json: ${error.message}\x1b[0m`
      );
    });

    describe('GitHub Actions workflow checks', () => {
      it('verifies workflow file node version matches .nvmrc', () => {
        mockReadFileSync
          .mockReturnValueOnce('18\n') // .nvmrc
          .mockReturnValueOnce(JSON.stringify({ engines: { node: '18' } })) // package.json
          .mockReturnValueOnce('node-version: 18\n'); // workflow file

        shellUtils.checkNodeVersion(mockExecSync);

        const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
        expect(calls).toEqual([
          '\x1b[33mChecking Node.js version consistency...\x1b[0m',
          '\n\x1b[33mChecking package.json...\x1b[0m',
          '\x1b[32m✅ package.json Node.js version matches .nvmrc\x1b[0m',
          '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
          '\x1b[32m✅ ci.yml Node.js version matches .nvmrc\x1b[0m',
          '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
        ]);
      });

      it('exits when workflow file node version does not match .nvmrc', () => {
        mockReadFileSync
          .mockReturnValueOnce('18\n') // .nvmrc
          .mockReturnValueOnce(JSON.stringify({ engines: { node: '18' } })) // package.json
          .mockReturnValueOnce('node-version: 16\n'); // workflow file

        shellUtils.checkNodeVersion(mockExecSync);

        const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
        expect(calls).toEqual([
          '\x1b[33mChecking Node.js version consistency...\x1b[0m',
          '\n\x1b[33mChecking package.json...\x1b[0m',
          '\x1b[32m✅ package.json Node.js version matches .nvmrc\x1b[0m',
          '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
          '\x1b[33m    Please update ci.yml to use version from .nvmrc\x1b[0m',
          '\x1b[32m✅ ci.yml Node.js version matches .nvmrc\x1b[0m',
          '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
        ]);
        expect(mockConsoleError).toHaveBeenCalledWith(
          '\x1b[31m❌ Error: Node.js version in ci.yml (16) does not match .nvmrc (18)\x1b[0m'
        );
      });

      it('handles workflow files without node version', () => {
        mockReadFileSync
          .mockReturnValueOnce('18\n') // .nvmrc
          .mockReturnValueOnce(JSON.stringify({ engines: { node: '18' } })) // package.json
          .mockReturnValueOnce('name: CI\n'); // workflow file

        shellUtils.checkNodeVersion(mockExecSync);

        const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
        expect(calls).toEqual([
          '\x1b[33mChecking Node.js version consistency...\x1b[0m',
          '\n\x1b[33mChecking package.json...\x1b[0m',
          '\x1b[32m✅ package.json Node.js version matches .nvmrc\x1b[0m',
          '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
          '\x1b[33mℹ️ ci.yml does not specify a Node.js version directly. Skipping check.\x1b[0m',
          '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
        ]);
      });

      it('handles missing workflow directory', () => {
        mockExistsSync.mockReturnValue(false);

        shellUtils.checkNodeVersion(mockExecSync);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining(
            'ℹ️ No GitHub Actions workflow directory found'
          )
        );
      });
    });

    it('should handle workflow files with invalid node-version format', () => {
      mockReaddirSync.mockReturnValue(['ci.yml']);
      mockReadFileSync.mockImplementation((file) => {
        if (file === '.nvmrc') return '18.17.0';
        if (file === 'package.json')
          return JSON.stringify({ engines: { node: '18.17.0' } });
        if (file === '.github/workflows/ci.yml')
          return 'node-version: invalid-format';
        return '';
      });

      shellUtils.checkNodeVersion(mockExecSync);
      const calls = mockConsoleLog.mock.calls.map((call) => call[0]);
      expect(calls).toEqual([
        '\x1b[33mChecking Node.js version consistency...\x1b[0m',
        '\n\x1b[33mChecking package.json...\x1b[0m',
        '\x1b[32m✅ package.json Node.js version matches .nvmrc\x1b[0m',
        '\n\x1b[33mChecking GitHub Actions workflows...\x1b[0m',
        "\x1b[33mℹ️ ci.yml contains node-version but couldn't extract version number. Please check manually.\x1b[0m",
        '\n\x1b[32m✅ All Node.js version references are in sync with .nvmrc\x1b[0m',
      ]);
    });
  });

  describe('switchNodeVersion', () => {
    beforeEach(() => {
      mockExecSync.mockReturnValue('v18.0.0');
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReset();
      mockConsoleError.mockClear();
    });

    it('switches to required Node.js version using home nvm', () => {
      mockReadFileSync.mockReturnValue('18\n');
      mockExecSync
        .mockReturnValueOnce('v16.0.0') // Initial node -v
        .mockReturnValueOnce('') // source ~/.nvm/nvm.sh
        .mockReturnValueOnce('Now using node v18.0.0') // nvm use
        .mockReturnValueOnce('v18.0.0'); // Final node -v

      shellUtils.switchNodeVersion(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'source $HOME/.nvm/nvm.sh && nvm use 18',
        expect.any(Object)
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('Switching to Node.js 18...');
    });

    it('switches to required Node.js version using brew nvm', () => {
      mockReadFileSync.mockReturnValue('18\n');
      mockExistsSync
        .mockReturnValueOnce(false) // $HOME/.nvm/nvm.sh
        .mockReturnValue(true); // brew nvm path
      mockExecSync
        .mockReturnValueOnce('v16.0.0') // Initial node -v
        .mockReturnValueOnce('/usr/local/opt/nvm') // brew --prefix nvm
        .mockReturnValueOnce('Now using node v18.0.0') // nvm use
        .mockReturnValueOnce('v18.0.0'); // Final node -v

      shellUtils.switchNodeVersion(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'source $(brew --prefix nvm)/nvm.sh && nvm use 18',
        expect.any(Object)
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('Switching to Node.js 18...');
    });

    it('exits when nvm is not found', () => {
      mockReadFileSync.mockReturnValue('18\n');
      mockExistsSync.mockReturnValue(false);
      mockExecSync
        .mockReturnValueOnce('v16.0.0') // Initial node -v
        .mockImplementationOnce(() => {
          throw new Error('Command failed: brew --prefix nvm');
        });

      shellUtils.switchNodeVersion(mockExecSync);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '\x1b[31mError: Could not find nvm. Please install nvm or switch to Node.js 18 manually.\x1b[0m'
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('exits when version switch fails', () => {
      mockReadFileSync.mockReturnValue('18\n');
      mockExecSync
        .mockReturnValueOnce('v16.0.0') // Initial node -v
        .mockReturnValueOnce('') // source ~/.nvm/nvm.sh
        .mockImplementationOnce(() => {
          throw new Error('N/A: version "18" is not yet installed');
        });

      shellUtils.switchNodeVersion(mockExecSync);

      const calls = mockConsoleError.mock.calls.map((call) => call[0]);
      expect(calls).toEqual([
        '\x1b[31mError: Could not determine current Node.js version.\x1b[0m',
        '\x1b[31m❌ Failed to switch to Node.js 18. Current version: vundefined\x1b[0m',
      ]);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('exits when switch command fails', () => {
      mockReadFileSync.mockReturnValue('18\n');
      mockExecSync
        .mockReturnValueOnce('v16.0.0') // Initial node -v
        .mockReturnValueOnce('') // source ~/.nvm/nvm.sh
        .mockImplementationOnce(() => {
          throw new Error('nvm use failed');
        });

      shellUtils.switchNodeVersion(mockExecSync);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '\x1b[31m❌ Failed to switch to Node.js 18. Current version: v\x1b[0m'
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle version switch failure', () => {
      mockReadFileSync.mockReturnValue('18.17.0');
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'node -v') return 'v16.0.0';
        if (cmd.includes('nvm use'))
          throw new Error('N/A: version "18" is not yet installed');
        return '';
      });

      shellUtils.switchNodeVersion(mockExecSync);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '\x1b[31mError: N/A: version "18" is not yet installed\x1b[0m'
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  // Basic smoke tests to verify module loading
  it('exports cleanDeep function', () => {
    expect(shellUtils.cleanDeep).toBeDefined();
    expect(typeof shellUtils.cleanDeep).toBe('function');
  });

  it('exports checkNodeVersion function', () => {
    expect(shellUtils.checkNodeVersion).toBeDefined();
    expect(typeof shellUtils.checkNodeVersion).toBe('function');
  });

  it('exports switchNodeVersion function', () => {
    expect(shellUtils.switchNodeVersion).toBeDefined();
    expect(typeof shellUtils.switchNodeVersion).toBe('function');
  });
});
