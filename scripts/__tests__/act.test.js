/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync, spawn } from 'node:child_process';
import {
  buildActCommand,
  getTokensFromEnv,
  ensureArtifactsDir,
  createTempDir,
  copyFilesToTempDir,
  execCmd,
} from '../bin/act.js';
import runAct from '../bin/act.js';

// Mock for console
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock for execSync
vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
  spawn: vi.fn(),
}));

// First test - we'll focus on building the act command properly
describe('buildActCommand', () => {
  it('should build basic command with empty tokens and no args', () => {
    // Act
    const cmd = buildActCommand({}, '/tmp/dir');

    // Assert
    expect(cmd).toEqual([
      'act',
      '-C',
      '/tmp/dir',
      '--artifact-server-path',
      './artifacts',
      '-P',
      'ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest',
    ]);
  });

  it('should build command with tokens and arguments', () => {
    // Arrange
    const tokens = {
      GITHUB_TOKEN: 'abc123',
      EMPTY_TOKEN: '',
      NULL_TOKEN: null,
    };
    const args = ['--workflows', '.github/workflows/ci.yml'];

    // Act
    const cmd = buildActCommand(tokens, '/tmp/dir', args);

    // Assert
    expect(cmd).toEqual([
      'act',
      '--workflows',
      '.github/workflows/ci.yml',
      '-s',
      'GITHUB_TOKEN=abc123',
      '-C',
      '/tmp/dir',
      '--artifact-server-path',
      './artifacts',
      '-P',
      'ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest',
    ]);

    // Should only include tokens with actual values
    expect(cmd).not.toContain('EMPTY_TOKEN=');
    expect(cmd).not.toContain('NULL_TOKEN=');
  });
});

describe('getTokensFromEnv', () => {
  // Save original process.env
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset process.env before each test
    process.env = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  it('should return tokens from environment variables', () => {
    // Arrange
    process.env.GITHUB_TOKEN = 'github-token-value';
    process.env.SONAR_TOKEN = 'sonar-token-value';
    process.env.EMPTY_TOKEN = '';

    // Act
    const tokens = getTokensFromEnv();

    // Assert
    expect(tokens).toEqual({
      GITHUB_TOKEN: 'github-token-value',
      SONAR_TOKEN: 'sonar-token-value',
      CODECOV_TOKEN: '',
      SNYK_TOKEN: '',
    });
  });
});

describe('ensureArtifactsDir', () => {
  // Mock fs functions
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create artifacts directory if it does not exist', () => {
    // Arrange
    const mockExistsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mockMkdirSync = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const rootDir = '/fake/root/dir';

    // Act
    const artifactsDir = ensureArtifactsDir(rootDir, { fs });

    // Assert
    expect(artifactsDir).toBe(path.join(rootDir, 'artifacts'));
    expect(mockExistsSync).toHaveBeenCalledWith(path.join(rootDir, 'artifacts'));
    expect(mockMkdirSync).toHaveBeenCalledWith(path.join(rootDir, 'artifacts'), {
      recursive: true,
    });
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Created artifacts directory')
    );
  });

  it('should not create artifacts directory if it already exists', () => {
    // Arrange
    const mockExistsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const mockMkdirSync = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const rootDir = '/fake/root/dir';

    // Act
    const artifactsDir = ensureArtifactsDir(rootDir, { fs });

    // Assert
    expect(artifactsDir).toBe(path.join(rootDir, 'artifacts'));
    expect(mockExistsSync).toHaveBeenCalledWith(path.join(rootDir, 'artifacts'));
    expect(mockMkdirSync).not.toHaveBeenCalled();
    expect(mockConsoleLog).not.toHaveBeenCalledWith(
      expect.stringContaining('Created artifacts directory')
    );
  });
});

describe('createTempDir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a temporary directory', () => {
    // Arrange - use fake objects instead of mocking non-existent methods
    const fakeTmpDir = '/tmp';
    const fakeFullPath = '/tmp/act-workspace-123';

    const fakeFs = {
      mkdtempSync: vi.fn().mockReturnValue(fakeFullPath),
    };

    const fakeOs = {
      tmpdir: vi.fn().mockReturnValue(fakeTmpDir),
    };

    // Act
    const tempDir = createTempDir({ fs: fakeFs, os: fakeOs });

    // Assert
    expect(tempDir).toBe(fakeFullPath);
    expect(fakeFs.mkdtempSync).toHaveBeenCalledWith(path.join(fakeTmpDir, 'act-workspace-'));
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Creating temporary workspace')
    );
  });
});

describe('copyFilesToTempDir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should copy files using rsync on Unix-like systems', () => {
    // Arrange
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
    });

    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from(''));

    const rootDir = '/project/root';
    const tempDir = '/tmp/act-workspace-123';

    // Act
    copyFilesToTempDir(rootDir, tempDir);

    // Assert
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining(
        `rsync -a --exclude="node_modules" --exclude="**/node_modules" ${rootDir}/ ${tempDir}/`
      ),
      expect.anything()
    );

    // Restore
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  it('should copy files using robocopy on Windows if available', () => {
    // Arrange
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    });

    // Mock dependencies
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from(''));

    // First mock the hasCommand function to return true for robocopy
    const hasCommandMock = vi.fn().mockReturnValue(true);

    const rootDir = 'C:\\project\\root';
    const tempDir = 'C:\\temp\\act-workspace-123';

    // Act
    copyFilesToTempDir(rootDir, tempDir, { hasCommand: hasCommandMock });

    // Assert
    expect(hasCommandMock).toHaveBeenCalledWith('robocopy');
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('robocopy'),
      expect.anything()
    );

    // Restore
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  it('should copy files using xcopy on Windows if robocopy is not available', () => {
    // Arrange
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    });

    // Mock dependencies
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from(''));

    // First mock the hasCommand function to return false for robocopy
    const hasCommandMock = vi.fn().mockReturnValue(false);

    const rootDir = 'C:\\project\\root';
    const tempDir = 'C:\\temp\\act-workspace-123';

    // Act
    copyFilesToTempDir(rootDir, tempDir, { hasCommand: hasCommandMock });

    // Assert
    expect(hasCommandMock).toHaveBeenCalledWith('robocopy');
    expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('xcopy'), expect.anything());

    // Restore
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });
});

describe('runAct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should be a function', async () => {
    // Import the function
    const { default: runAct } = await import('../bin/act.js');

    // Assert
    expect(typeof runAct).toBe('function');
  });

  it('should handle errors gracefully', async () => {
    // Import the function
    const { default: runAct } = await import('../bin/act.js');

    // Create dependencies that will throw an error
    const deps = {
      execCmd: () => {
        throw new Error('Test error');
      },
    };

    // Act
    const result = await runAct([], deps);

    // Assert
    expect(result).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error running act'));
  });
});
