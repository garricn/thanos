#!/usr/bin/env node

import { spawn, exec, execSync } from 'child_process';
import waitOn from 'wait-on';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

// Store child processes for cleanup
const childProcesses = [];
let webExitCode = 0;
let apiExitCode = 0;

/**
 * Execute a command synchronously
 * @param {string} command The command to execute
 * @param {object} options Options for child_process.execSync
 * @returns {string} The command output
 */
export function execCmd(command, options = {}) {
  console.log(`${colors.yellow}Executing: ${command}${colors.reset}`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      ...options,
    });
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    throw error;
  }
}

/**
 * Kill processes on specific ports
 * @param {number[]} ports Array of ports to kill processes on
 */
export function killProcessesOnPorts(ports) {
  try {
    const portsStr = ports.join(',');
    console.log(
      `${colors.yellow}Cleaning up any existing processes on ports ${portsStr}...${colors.reset}`
    );

    // Different commands for different platforms
    if (process.platform === 'win32') {
      // Windows
      ports.forEach((port) => {
        try {
          const output = execSync(`netstat -ano | findstr :${port}`, {
            stdio: 'pipe',
          }).toString();
          const lines = output.split('\n');
          lines.forEach((line) => {
            const match = line.match(/(\d+)$/);
            if (match) {
              const pid = match[1];
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
            }
          });
        } catch (e) {
          // Ignore errors if no processes are found
        }
      });
    } else {
      // Unix-like (macOS, Linux)
      try {
        execSync(`lsof -ti:${portsStr} | xargs kill -9`, { stdio: 'pipe' });
      } catch (e) {
        // Ignore errors if no processes are found
      }
    }
  } catch (error) {
    console.error(
      `${colors.red}Error killing processes:${colors.reset}`,
      error.message
    );
    // Continue execution even if this fails
  }
}

/**
 * Start a server and return the child process
 * @param {string} command Command to start the server
 * @param {string} name Name of the server for logging
 * @returns {ChildProcess} The spawned child process
 */
export function startServer(command, name) {
  console.log(`${colors.yellow}Starting ${name} server...${colors.reset}`);

  // Split the command into command and args
  const [cmd, ...args] = command.split(' ');
  const childProcess = spawn(cmd, args, {
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
    console.error(
      `${colors.red}Failed to start ${name}:${colors.reset}`,
      error.message
    );
  });

  return childProcess;
}

/**
 * Clean up all child processes
 */
export function cleanup() {
  console.log(`${colors.yellow}Shutting down servers...${colors.reset}`);

  // Send SIGTERM to all child processes
  childProcesses.forEach((proc) => {
    if (!proc.killed) {
      proc.kill('SIGTERM');
    }
  });

  // Give processes a moment to shut down gracefully
  setTimeout(() => {
    // Force kill any remaining processes on the ports
    killProcessesOnPorts([4200, 3000]);
    console.log(
      `${colors.green}All servers have been shut down.${colors.reset}`
    );
  }, 2000);
}

/**
 * Main function to run E2E tests
 */
export async function runE2ETests() {
  try {
    // Kill any existing processes on the ports we need
    killProcessesOnPorts([4200, 3000]);

    // Start both servers
    const webServer = startServer('npm run start:web', 'Web');
    const apiServer = startServer('npm run start:api', 'API');

    // Set up cleanup on exit
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
    process.on('uncaughtException', (error) => {
      console.error(`${colors.red}Uncaught exception:${colors.reset}`, error);
      cleanup();
      process.exit(1);
    });

    // Wait for servers to be ready
    console.log(
      `${colors.yellow}Waiting for servers to be ready...${colors.reset}`
    );
    await waitOn({
      resources: ['http://localhost:4200', 'http://localhost:3000'],
      timeout: 60000,
    });

    // Run Web E2E tests
    console.log(`${colors.yellow}Running Web E2E tests...${colors.reset}`);
    try {
      execCmd('cd apps/web/e2e && npx cypress run');
      webExitCode = 0;
    } catch (error) {
      console.error(`${colors.red}Web E2E tests failed${colors.reset}`);
      webExitCode = 1;
    }

    // Run API E2E tests
    console.log(`${colors.yellow}Running API E2E tests...${colors.reset}`);
    try {
      execCmd(
        "cd apps/api/e2e && NODE_OPTIONS='--experimental-vm-modules' npx jest --config configs/test/jest.config.mjs --verbose --no-cache"
      );
      apiExitCode = 0;
    } catch (error) {
      console.error(`${colors.red}API E2E tests failed${colors.reset}`);
      apiExitCode = 1;
    }

    // Clean up before exiting
    cleanup();

    // Determine final exit code
    if (webExitCode !== 0 || apiExitCode !== 0) {
      console.error(`${colors.red}E2E tests failed!${colors.reset}`);
      console.error(
        `${colors.red}Web E2E exit code: ${webExitCode}${colors.reset}`
      );
      console.error(
        `${colors.red}API E2E exit code: ${apiExitCode}${colors.reset}`
      );
      process.exit(1);
    } else {
      console.log(`${colors.green}All E2E tests passed!${colors.reset}`);
      process.exit(0);
    }
  } catch (error) {
    console.error(
      `${colors.red}Error running E2E tests:${colors.reset}`,
      error
    );
    cleanup();
    process.exit(1);
  }
}

// Start the tests if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runE2ETests();
}
