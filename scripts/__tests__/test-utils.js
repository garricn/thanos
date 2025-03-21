import { jest } from '@jest/globals';

// Common process and console mocks
export function setupProcessMocks() {
  return {
    mockExit: jest.spyOn(process, 'exit').mockImplementation(() => {}),
    mockCwd: jest.spyOn(process, 'cwd').mockImplementation(() => '/mock/path'),
  };
}

export function setupConsoleMocks() {
  return {
    mockConsoleLog: jest.spyOn(console, 'log').mockImplementation(() => {}),
    mockConsoleError: jest.spyOn(console, 'error').mockImplementation(() => {}),
  };
}

// Common exec mock setup
export function setupExecMock() {
  return jest.fn();
}

// Create mock states for different scenarios
export function createMockState({
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
  const mockExecSync = jest.fn();
  const mockSpawn = jest.fn();
  const mockReadFileSync = jest.fn();
  const mockExistsSync = jest.fn();
  const mockReaddirSync = jest.fn();
  const mockWaitOn = jest.fn();

  // Mock child_process
  jest.mock('child_process', () => ({
    execSync: mockExecSync,
    spawn: mockSpawn,
  }));

  // Mock fs
  jest.mock('fs', () => ({
    readFileSync: mockReadFileSync,
    existsSync: mockExistsSync,
    readdirSync: mockReaddirSync,
  }));

  // Mock wait-on
  jest.mock('wait-on', () => ({
    __esModule: true,
    default: mockWaitOn,
  }));

  return {
    mockExecSync,
    mockSpawn,
    mockReadFileSync,
    mockExistsSync,
    mockReaddirSync,
    mockWaitOn,
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
