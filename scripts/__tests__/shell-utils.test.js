import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import shellUtils from '../lib/shell-utils.js';

// Mock process.exit to prevent tests from exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

// Mock console methods to keep output clean
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Mock modules
const mockExecSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockExistsSync = jest.fn();

jest.unstable_mockModule('node:child_process', () => ({
  execSync: mockExecSync,
}));

jest.unstable_mockModule('node:fs', () => ({
  readFileSync: mockReadFileSync,
  existsSync: mockExistsSync,
}));

describe('shell-utils', () => {
  beforeEach(() => {
    mockExecSync.mockClear();
    mockReadFileSync.mockClear();
    mockExistsSync.mockClear();
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
