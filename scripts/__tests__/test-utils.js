import { vi, expect, beforeEach } from 'vitest';

// Global mock functions that tests can access directly
export const mockExecSync = vi.fn();
export const mockReadFileSync = vi.fn();
export const mockExistsSync = vi.fn();
export const mockCopyFileSync = vi.fn();
export const mockUnlinkSync = vi.fn();
export const mockReaddirSync = vi.fn();
export const mockMkdirSync = vi.fn();
export const mockSpawn = vi.fn();
export const mockWaitOn = vi.fn();

// Mock module imports
vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
  spawn: mockSpawn,
}));

vi.mock('node:fs', () => {
  const fsMock = {
    readFileSync: mockReadFileSync,
    existsSync: mockExistsSync,
    copyFileSync: mockCopyFileSync,
    unlinkSync: mockUnlinkSync,
    readdirSync: mockReaddirSync,
    mkdirSync: mockMkdirSync,
    statSync: vi.fn().mockReturnValue({
      isDirectory: vi.fn().mockReturnValue(false),
    }),
    writeFileSync: vi.fn(),
  };
  return {
    ...fsMock,
    default: fsMock,
  };
});

// Mock path
vi.mock('node:path', () => {
  const pathMock = {
    resolve: vi.fn().mockImplementation((...args) => args.join('/')),
    dirname: vi
      .fn()
      .mockImplementation((path) => path.split('/').slice(0, -1).join('/')),
    join: vi.fn().mockImplementation((...args) => args.join('/')),
  };
  return {
    ...pathMock,
    default: pathMock,
  };
});

vi.mock('node:url', () => ({
  fileURLToPath: vi
    .fn()
    .mockImplementation((url) => url.replace('file://', '')),
}));

vi.mock('wait-on', () => ({
  default: mockWaitOn,
}));

// Mock console methods
export const mockConsoleLog = vi
  .spyOn(console, 'log')
  .mockImplementation(() => {});
export const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Mock process.exit
export const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

/**
 * Setup initial mock state with common defaults
 */
export function setupMockDefaults() {
  // Reset all mocks
  vi.clearAllMocks();

  // Setup execSync defaults
  mockExecSync.mockImplementation((command) => {
    if (command === 'node -v') return 'v20.0.0';
    if (command === 'npm -v') return '9.0.0';
    return '';
  });

  // Setup readFileSync defaults
  mockReadFileSync.mockImplementation((path) => {
    if (path === '.nvmrc') return '20.0.0\n';
    return '';
  });

  // Setup existsSync defaults
  mockExistsSync.mockImplementation((path) => {
    if (path === '.nvmrc') return true;
    if (path === '/home/test/.nvm/nvm.sh') return true;
    if (path.includes('/coverage/')) return true;
    return false;
  });

  return {
    mockExecSync,
    mockReadFileSync,
    mockExistsSync,
    mockCopyFileSync,
    mockUnlinkSync,
    mockReaddirSync,
    mockConsoleLog,
    mockConsoleError,
    mockExit,
  };
}

/**
 * Helper to reset mocks before each test
 */
export function setupBeforeEach() {
  beforeEach(() => {
    setupMockDefaults();
  });
}

/**
 * Creates a customized mock state for specific test scenarios
 */
export function createMockState({
  execSyncOutput = '',
  execSyncError = null,
  readFileSyncOutput = '',
  readFileSyncError = null,
  existsSyncOutput = true,
  existsSyncError = null,
  copyFileSyncError = null,
  unlinkSyncError = null,
} = {}) {
  if (execSyncError) {
    mockExecSync.mockImplementation(() => {
      throw execSyncError;
    });
  } else if (execSyncOutput) {
    mockExecSync.mockReturnValue(execSyncOutput);
  }

  if (readFileSyncError) {
    mockReadFileSync.mockImplementation(() => {
      throw readFileSyncError;
    });
  } else if (readFileSyncOutput) {
    mockReadFileSync.mockReturnValue(readFileSyncOutput);
  }

  if (existsSyncError) {
    mockExistsSync.mockImplementation(() => {
      throw existsSyncError;
    });
  } else {
    mockExistsSync.mockReturnValue(existsSyncOutput);
  }

  if (copyFileSyncError) {
    mockCopyFileSync.mockImplementation(() => {
      throw copyFileSyncError;
    });
  }

  if (unlinkSyncError) {
    mockUnlinkSync.mockImplementation(() => {
      throw unlinkSyncError;
    });
  }

  return {
    mockExecSync,
    mockReadFileSync,
    mockExistsSync,
    mockCopyFileSync,
    mockUnlinkSync,
  };
}

// Common process and console mocks
export function setupProcessMocks() {
  return {
    mockExit: vi.spyOn(process, 'exit').mockImplementation(() => {}),
    mockCwd: vi.spyOn(process, 'cwd').mockImplementation(() => '/mock/path'),
  };
}

export function setupConsoleMocks() {
  return {
    mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
    mockConsoleError: vi.spyOn(console, 'error').mockImplementation(() => {}),
  };
}

// Common exec mock setup
export function setupExecMock() {
  return vi.fn();
}

// Create mock states for different scenarios
export function createBasicMockState({
  nodeVersion = '18',
  npmVersion = '9.0.0',
  success = true,
  error = null,
  force = false,
  dryRun = false,
} = {}) {
  return {
    nodeVersion,
    npmVersion,
    success,
    error,
    force,
    dryRun,
  };
}

// Helper for command execution states
export function createCommandState({
  command,
  output = '',
  error = null,
  exitCode = 0,
} = {}) {
  return {
    command,
    output,
    error,
    exitCode,
  };
}

// Common assertion patterns
export function expectCommandExecuted(mockExec, command, options = {}) {
  expect(mockExec).toHaveBeenCalledWith(
    command,
    expect.objectContaining(options)
  );
}

export function expectSuccessMessage(mockConsole, message) {
  expect(mockConsole).toHaveBeenCalledWith(
    expect.stringContaining(`✓ ${message}`)
  );
}

export function expectErrorMessage(mockConsole, message) {
  expect(mockConsole).toHaveBeenCalledWith(
    expect.stringContaining(`Error: ${message}`)
  );
}

export function expectWarningMessage(mockConsole, message) {
  expect(mockConsole).toHaveBeenCalledWith(
    expect.stringContaining(`⚠️ ${message}`)
  );
}

// Setup and teardown helpers
export function setupTestEnvironment() {
  const mocks = {
    ...setupProcessMocks(),
    ...setupConsoleMocks(),
    mockExec: setupExecMock(),
  };

  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockClear());
  });

  return mocks;
}

// Common mock module setup
export function setupCommonMocks() {
  // Mock console.log and console.error
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock process.exit
  vi.spyOn(process, 'exit').mockImplementation(() => {});

  return {
    mockExecSync: vi.mocked(async () => import('node:child_process')).execSync,
    mockReadFileSync: vi.mocked(async () => import('node:fs')).readFileSync,
    mockExistsSync: vi.mocked(async () => import('node:fs')).existsSync,
    mockReaddirSync: vi.mocked(async () => import('node:fs')).readdirSync,
  };
}

// Version management mock states
export function createVersionState({
  requiredVersion = '18',
  currentVersion = '18',
  force = false,
  error = null,
} = {}) {
  return {
    requiredVersion,
    currentVersion,
    force,
    error,
  };
}

// Clean operations mock states
export function createCleanState({
  nodeVersion = '18',
  npmVersion = '9.0.0',
  jestCache = true,
  dryRun = false,
  force = false,
} = {}) {
  return {
    nodeVersion,
    npmVersion,
    jestCache,
    dryRun,
    force,
  };
}

// Git operations mock states
export function createGitState({
  stagedFiles = [],
  hasTypeScriptFiles = true,
  lintPass = true,
  typePass = true,
  testPass = true,
} = {}) {
  return {
    stagedFiles,
    hasTypeScriptFiles,
    lintPass,
    typePass,
    testPass,
  };
}
