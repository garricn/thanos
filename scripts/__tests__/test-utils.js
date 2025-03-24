import { vi, expect, beforeEach } from 'vitest';

// Global mock functions that tests can access directly
export const mockExecSync = vi.fn().mockImplementation(command => {
  if (command === 'node -v') return 'v20.0.0';
  if (command === 'npm -v') return '9.0.0';
  if (command === 'npm cache clean --force') return '';
  if (command === 'rm -rf node_modules') return '';
  if (command === 'rm -rf dist tmp coverage') return '';
  if (command === 'npm install') return '';
  if (command.includes('test:scripts:coverage')) return '';
  if (command.includes('test --workspace=apps/api')) return '';
  if (command.includes('test --workspace=apps/web')) return '';
  if (command.includes('testNamePattern=snapshot')) return '';
  if (command.includes('open')) return '';
  if (command.includes('npm run node:version')) return '';
  if (command.includes('npm run type-check')) return '';
  if (command.includes('npm run lint')) return '';
  if (command.includes('npm run test:unit')) return '';
  if (command.includes('npx lint-staged')) return '';
  if (command.includes('npx tsc --noEmit')) return '';
  if (
    command === 'rm -rf node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs'
  )
    return '';
  throw new Error(`Unexpected command: ${command}`);
});
export const mockReadFileSync = vi.fn();
export const mockExistsSync = vi.fn();
export const mockCopyFileSync = vi.fn();
export const mockUnlinkSync = vi.fn();
export const mockReaddirSync = vi.fn();
export const mockMkdirSync = vi.fn();
export const mockSpawn = vi.fn();
export const mockWaitOn = vi.fn();
export const mockWriteFileSync = vi.fn();

// Mock DOMParser and XMLSerializer
export const mockParseFromString = vi.fn();
export const mockSerializeToString = vi.fn();

global.DOMParser = class {
  parseFromString(content, type) {
    return mockParseFromString(content, type);
  }
};

global.XMLSerializer = class {
  serializeToString(doc) {
    return mockSerializeToString(doc);
  }
};

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
    writeFileSync: mockWriteFileSync,
    statSync: vi.fn().mockReturnValue({
      isDirectory: vi.fn().mockReturnValue(false),
    }),
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
    dirname: vi.fn().mockImplementation(path => path.split('/').slice(0, -1).join('/')),
    join: vi.fn().mockImplementation((...args) => args.join('/')),
  };
  return {
    ...pathMock,
    default: pathMock,
  };
});

vi.mock('node:url', () => ({
  fileURLToPath: vi.fn().mockImplementation(url => url.replace('file://', '')),
}));

vi.mock('wait-on', () => ({
  default: mockWaitOn,
}));

// Mock console methods
export const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
export const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock process.exit
export const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

/**
 * Setup initial mock state with common defaults
 */
export function setupMockDefaults() {
  // Reset all mocks
  mockExecSync.mockReset();
  mockReadFileSync.mockReset();
  mockExistsSync.mockReset();
  mockMkdirSync.mockReset();
  mockWriteFileSync.mockReset();
  mockCopyFileSync.mockReset();
  mockUnlinkSync.mockReset();
  mockConsoleLog.mockReset();
  mockConsoleError.mockReset();
  mockParseFromString.mockReset();
  mockSerializeToString.mockReset();

  // Mock execSync for various commands
  mockExecSync.mockImplementation(command => {
    if (command === 'rm -rf coverage') return '';
    if (command === 'rm -rf node_modules') return '';
    if (command === 'npm -v') return '9.0.0';
    if (command === 'npm cache clean --force') return '';
    if (command === 'npx vitest --clearCache') return '';
    if (command === 'npm install') return '';
    if (command.includes('test:scripts:coverage')) return '';
    if (command.includes('test --workspace=apps/api')) return '';
    if (command.includes('test --workspace=apps/web')) return '';
    if (command.includes('testNamePattern=snapshot')) return '';
    if (command.includes('open')) return '';
    if (command.includes('npm run node:version')) return '';
    if (command.includes('npm run type-check')) return '';
    if (command.includes('npm run lint')) return '';
    if (command.includes('npm run test:unit')) return '';
    if (command.includes('npx lint-staged')) return '';
    if (command.includes('npx tsc --noEmit')) return '';
    if (
      command === 'rm -rf node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs'
    )
      return '';
    throw new Error(`Unexpected command: ${command}`);
  });

  // Mock readFileSync for various file paths
  mockReadFileSync.mockImplementation(path => {
    if (path.includes('lcov.info')) {
      return 'LF:10\nLH:5\nend_of_record';
    }
    if (path.includes('trend.json')) {
      return JSON.stringify([
        {
          date: '2023-12-31T00:00:00.000Z',
          coverage: 40.0,
          totalLines: 10,
          linesCovered: 4,
        },
      ]);
    }
    if (path.includes('coverage-final.json')) {
      return JSON.stringify({});
    }
    if (path.includes('sonar-report.xml') || path.includes('test-report.xml')) {
      return '<?xml version="1.0"?><coverage><file path="test.js"><line number="1" hits="1"/></file></coverage>';
    }
    throw new Error(`Unexpected file read: ${path}`);
  });

  // Mock existsSync for various paths
  mockExistsSync.mockImplementation(path => {
    return (
      path.includes('lcov.info') ||
      path.includes('lcov-report') ||
      path.includes('trend.json') ||
      path.includes('coverage-final.json') ||
      path.includes('sonar-report.xml') ||
      path.includes('test-report.xml') ||
      path.includes('coverage/api/unit') ||
      path.includes('coverage/web/unit') ||
      path.includes('coverage/web/snapshot') ||
      path.includes('coverage/scripts/unit') ||
      path.includes('coverage/combined') ||
      path.includes('apps/api/test-report.xml') ||
      path.includes('apps/web/test-report.xml') ||
      path.includes('scripts/test-report.xml')
    );
  });

  // Mock mkdirSync to track calls
  mockMkdirSync.mockImplementation(() => undefined);

  // Mock writeFileSync to track calls
  mockWriteFileSync.mockImplementation(() => undefined);

  // Mock copyFileSync to track calls
  mockCopyFileSync.mockImplementation(() => undefined);

  // Mock unlinkSync to track calls
  mockUnlinkSync.mockImplementation(() => undefined);

  // Mock console.log to track calls
  mockConsoleLog.mockImplementation(() => undefined);

  // Mock console.error to track calls
  mockConsoleError.mockImplementation(() => undefined);

  // Mock XML parser
  mockParseFromString.mockImplementation(() => ({
    documentElement: {
      getElementsByTagName: () => ({
        length: 1,
        item: () => ({
          getAttribute: () => 'test.js',
          getElementsByTagName: () => ({
            length: 1,
            item: () => ({
              getAttribute: () => '1',
            }),
          }),
        }),
      }),
      appendChild: () => undefined,
    },
  }));

  // Mock XML serializer
  mockSerializeToString.mockImplementation(
    () =>
      '<?xml version="1.0"?><coverage><file path="test.js"><line number="1" hits="1"/></file></coverage>'
  );

  return {
    mockExecSync,
    mockReadFileSync,
    mockExistsSync,
    mockMkdirSync,
    mockWriteFileSync,
    mockCopyFileSync,
    mockUnlinkSync,
    mockConsoleLog,
    mockConsoleError,
    mockParseFromString,
    mockSerializeToString,
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
export function createCommandState({ command, output = '', error = null, exitCode = 0 } = {}) {
  return {
    command,
    output,
    error,
    exitCode,
  };
}

// Common assertion patterns
export function expectCommandExecuted(mockExec, command, options = {}) {
  expect(mockExec).toHaveBeenCalledWith(command, expect.objectContaining(options));
}

export function expectSuccessMessage(mockConsole, message) {
  expect(mockConsole).toHaveBeenCalledWith(expect.stringContaining(`✓ ${message}`));
}

export function expectErrorMessage(mockConsole, message) {
  expect(mockConsole).toHaveBeenCalledWith(expect.stringContaining(`Error: ${message}`));
}

export function expectWarningMessage(mockConsole, message) {
  expect(mockConsole).toHaveBeenCalledWith(expect.stringContaining(`⚠️ ${message}`));
}

// Setup and teardown helpers
export function setupTestEnvironment() {
  const mocks = {
    ...setupProcessMocks(),
    ...setupConsoleMocks(),
    mockExec: setupExecMock(),
  };

  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
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
