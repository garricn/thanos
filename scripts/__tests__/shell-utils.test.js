import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock modules
const mockExecSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockExistsSync = jest.fn();
const mockReaddirSync = jest.fn();

jest.unstable_mockModule('node:child_process', () => ({
  execSync: mockExecSync,
}));

jest.unstable_mockModule('node:fs', () => ({
  readFileSync: mockReadFileSync,
  existsSync: mockExistsSync,
  readdirSync: mockReaddirSync,
}));

// Import after mocking
const shellUtils = (await import('../lib/shell-utils.js')).default;

// Mock process.exit to prevent tests from exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

// Mock console methods to keep output clean
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

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
