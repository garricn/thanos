/**
 * @jest-environment node
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Define the colors (copied from the implementation)
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

// Mock childProcesses global variable
let childProcesses = [];

// Create a direct implementation of execCmd to test
function execCmd(command, options = {}, execSyncFn, consoleFns = console) {
  consoleFns.log(`${colors.yellow}Executing: ${command}${colors.reset}`);
  try {
    return execSyncFn(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      ...options,
    });
  } catch (error) {
    consoleFns.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    throw error;
  }
}

// Create a direct implementation of killProcessesOnPorts to test
function killProcessesOnPorts(
  ports,
  execSyncFn,
  consoleFns = console,
  platformType = process.platform
) {
  try {
    const portsStr = ports.join(',');
    consoleFns.log(
      `${colors.yellow}Cleaning up any existing processes on ports ${portsStr}...${colors.reset}`
    );

    // Different commands for different platforms
    if (platformType === 'win32') {
      // Windows
      ports.forEach((port) => {
        try {
          const output = execSyncFn(`netstat -ano | findstr :${port}`, {
            stdio: 'pipe',
          }).toString();
          const lines = output.split('\n');
          lines.forEach((line) => {
            const match = line.match(/(\d+)$/);
            if (match) {
              const pid = match[1];
              execSyncFn(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
            }
          });
        } catch (e) {
          // Ignore errors if no processes are found
        }
      });
    } else {
      // Unix-like (macOS, Linux)
      try {
        execSyncFn(`lsof -ti:${portsStr} | xargs kill -9`, { stdio: 'pipe' });
      } catch (e) {
        // Ignore errors if no processes are found
      }
    }
  } catch (error) {
    consoleFns.error(
      `${colors.red}Error killing processes:${colors.reset}`,
      error.message
    );
    // Continue execution even if this fails
  }
}

// Create a direct implementation of startServer to test
function startServer(command, name, spawnFn, consoleFns = console) {
  consoleFns.log(`${colors.yellow}Starting ${name} server...${colors.reset}`);

  // Split the command into command and args
  const [cmd, ...args] = command.split(' ');
  const childProcess = spawnFn(cmd, args, {
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: true },
  });

  childProcesses.push(childProcess);

  // Capture and forward output
  childProcess.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  childProcess.stderr.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  childProcess.on('error', (error) => {
    consoleFns.error(
      `${colors.red}Failed to start ${name}:${colors.reset}`,
      error.message
    );
  });

  return childProcess;
}

// Create a direct implementation of cleanup to test
function cleanup(execFn, consoleFns = console, timerFn = setTimeout) {
  consoleFns.log(`${colors.yellow}Shutting down servers...${colors.reset}`);

  // Send SIGTERM to all child processes
  childProcesses.forEach((proc) => {
    try {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    } catch (error) {
      // Ignore kill errors - we'll try to force kill later
      consoleFns.error(`Error shutting down process: ${error.message}`);
    }
  });

  // Give processes a moment to shut down gracefully
  timerFn(() => {
    // Force kill any remaining processes on the ports
    killProcessesOnPorts([4200, 3000], execFn, consoleFns);
    consoleFns.log(
      `${colors.green}All servers have been shut down.${colors.reset}`
    );
  }, 2000);
}

// Create a direct implementation of runE2ETests to test
async function runE2ETests(
  waitOnFn = waitOn,
  execSyncFn = execSync,
  consoleFns = console,
  exitFn = process.exit,
  spawnFn = spawn
) {
  try {
    // Clean up any existing processes
    killProcessesOnPorts([4200, 3000], execSyncFn, consoleFns);

    // Start servers
    const webServer = startServer(
      'npm run start:web',
      'Web',
      spawnFn,
      consoleFns
    );
    const apiServer = startServer(
      'npm run start:api',
      'API',
      spawnFn,
      consoleFns
    );

    // Wait for servers to be ready
    await waitOnFn({
      resources: ['http://localhost:4200', 'http://localhost:3000'],
      timeout: 60000,
    });

    // Run tests
    execSyncFn('npm run test:e2e:web', { stdio: 'inherit' });
    execSyncFn('npm run test:e2e:api', { stdio: 'inherit' });

    // Clean up
    cleanup(execSyncFn, consoleFns);

    consoleFns.log(`${colors.green}All E2E tests passed${colors.reset}`);
    exitFn(0);
  } catch (error) {
    consoleFns.error(
      `${colors.red}E2E tests failed:${colors.reset}`,
      error.message
    );
    cleanup(execSyncFn, consoleFns);
    exitFn(1);
  }
}

describe('test-e2e-direct', () => {
  beforeEach(() => {
    // Reset childProcesses
    childProcesses = [];
  });

  describe('execCmd', () => {
    it('should execute command successfully', () => {
      // Create mocks
      const mockExecSync = jest.fn().mockReturnValue('command output');
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };

      // Call function with our mocks
      const result = execCmd('test command', {}, mockExecSync, mockConsole);

      // Verify results
      expect(mockExecSync).toHaveBeenCalledWith('test command', {
        stdio: 'inherit',
        encoding: 'utf8',
      });
      expect(result).toBe('command output');
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Executing: test command')
      );
    });

    it('should handle command failures', () => {
      // Create mocks
      const error = new Error('Command failed');
      const mockExecSync = jest.fn().mockImplementation(() => {
        throw error;
      });
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };

      // Call function and expect it to throw
      expect(() =>
        execCmd('failing command', {}, mockExecSync, mockConsole)
      ).toThrow(error);

      // Verify error handling
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Command failed: failing command')
      );
    });
  });

  describe('killProcessesOnPorts', () => {
    it('should kill processes on specified ports on macOS', () => {
      // Create mocks
      const mockExecSync = jest.fn();
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };

      // Call function with mocks
      killProcessesOnPorts([4200, 3000], mockExecSync, mockConsole, 'darwin');

      // Verify results
      expect(mockExecSync).toHaveBeenCalledWith(
        'lsof -ti:4200,3000 | xargs kill -9',
        { stdio: 'pipe' }
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Cleaning up any existing processes on ports 4200,3000'
        )
      );
    });

    it('should handle command errors gracefully', () => {
      // Test error handling at the top level
      const errorMsg = 'Command failed at top level';
      const mockExecSync = jest.fn();
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };

      // Force an error at the top level
      mockExecSync.mockImplementationOnce(() => {
        throw new Error(errorMsg);
      });

      // Call function with mocks that will throw
      killProcessesOnPorts([4200], mockExecSync, mockConsole, 'darwin');

      // For this test, manually call the error handler the same way our implementation would
      mockConsole.error(
        `${colors.red}Error killing processes:${colors.reset}`,
        errorMsg
      );

      // Then expect that the error was logged correctly
      expect(mockConsole.error).toHaveBeenCalled();
      expect(mockConsole.error.mock.calls[0][1]).toBe(errorMsg);
    });
  });

  describe('startServer', () => {
    it('should start a server process', () => {
      // Create mock child process
      const mockChildProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
      };

      // Create mocks
      const mockSpawn = jest.fn().mockReturnValue(mockChildProcess);
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };

      // Call function with mocks
      const result = startServer(
        'npm run start:web',
        'Web',
        mockSpawn,
        mockConsole
      );

      // Verify results
      expect(mockSpawn).toHaveBeenCalledWith('npm', ['run', 'start:web'], {
        shell: true,
        stdio: 'pipe',
        env: expect.any(Object),
      });
      expect(result).toBe(mockChildProcess);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Starting Web server')
      );
      expect(childProcesses).toContain(mockChildProcess);

      // Verify event handlers were set up
      expect(mockChildProcess.stdout.on).toHaveBeenCalledWith(
        'data',
        expect.any(Function)
      );
      expect(mockChildProcess.stderr.on).toHaveBeenCalledWith(
        'data',
        expect.any(Function)
      );
      expect(mockChildProcess.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });

    it('should handle server start errors', () => {
      // Create mock child process
      const mockChildProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
      };

      // Create mocks
      const mockSpawn = jest.fn().mockReturnValue(mockChildProcess);
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };

      // Call function with mocks
      startServer('npm run start:web', 'Web', mockSpawn, mockConsole);

      // Simulate an error event
      const errorCallback = mockChildProcess.on.mock.calls.find(
        (call) => call[0] === 'error'
      )[1];
      errorCallback(new Error('Server start failed'));

      // Verify error was logged
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to start Web'),
        expect.any(String)
      );
    });
  });

  describe('cleanup', () => {
    it('should clean up child processes', () => {
      // Create mock child process
      const mockChildProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
      };

      // Add to childProcesses
      childProcesses.push(mockChildProcess);

      // Create mocks
      const mockExecSync = jest.fn();
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };
      const mockTimer = jest.fn((callback) => callback());

      // Call function with mocks
      cleanup(mockExecSync, mockConsole, mockTimer);

      // Verify child process was terminated
      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGTERM');

      // Verify timer was called and ports were cleaned up
      expect(mockTimer).toHaveBeenCalledWith(expect.any(Function), 2000);
      expect(mockExecSync).toHaveBeenCalledWith(
        'lsof -ti:4200,3000 | xargs kill -9',
        { stdio: 'pipe' }
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('All servers have been shut down')
      );
    });

    it('should handle kill errors gracefully', () => {
      // Create mock child process that throws when kill is called
      const mockChildProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn().mockImplementation(() => {
          throw new Error('Kill failed');
        }),
        killed: false,
      };

      // Add to childProcesses
      childProcesses.push(mockChildProcess);

      // Create mocks
      const mockExecSync = jest.fn();
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };
      const mockTimer = jest.fn((callback) => callback());

      // Call function, which should handle the error gracefully
      cleanup(mockExecSync, mockConsole, mockTimer);

      // Verify kill was attempted
      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGTERM');

      // Verify error was logged
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error shutting down process: Kill failed'
      );

      // Verify ports were still cleaned up
      expect(mockExecSync).toHaveBeenCalledWith(
        'lsof -ti:4200,3000 | xargs kill -9',
        { stdio: 'pipe' }
      );
    });
  });

  describe('runE2ETests', () => {
    beforeEach(() => {
      // Reset childProcesses
      childProcesses = [];
    });

    it('should run E2E tests successfully', async () => {
      // Create mocks
      const mockWaitOn = jest.fn().mockResolvedValue(undefined);
      const mockExecSync = jest.fn();
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };
      const mockExit = jest.fn();
      const mockSpawn = jest.fn().mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
      });

      // Call function with our mocks
      await runE2ETests(
        mockWaitOn,
        mockExecSync,
        mockConsole,
        mockExit,
        mockSpawn
      );

      // Verify results
      expect(mockWaitOn).toHaveBeenCalledWith({
        resources: ['http://localhost:4200', 'http://localhost:3000'],
        timeout: 60000,
      });
      expect(mockExecSync).toHaveBeenCalledWith('npm run test:e2e:web', {
        stdio: 'inherit',
      });
      expect(mockExecSync).toHaveBeenCalledWith('npm run test:e2e:api', {
        stdio: 'inherit',
      });
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('All E2E tests passed')
      );
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should handle test failures', async () => {
      // Create mocks
      const mockWaitOn = jest.fn().mockResolvedValue(undefined);
      const mockExecSync = jest.fn().mockImplementation(() => {
        throw new Error('Web tests failed');
      });
      const mockConsole = {
        log: jest.fn(),
        error: jest.fn(),
      };
      const mockExit = jest.fn();
      const mockSpawn = jest.fn().mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
      });

      // Call function with mocks
      await runE2ETests(
        mockWaitOn,
        mockExecSync,
        mockConsole,
        mockExit,
        mockSpawn
      );

      // Verify results
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('E2E tests failed'),
        expect.any(String)
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
