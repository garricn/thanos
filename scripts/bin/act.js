#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

// ANSI color codes
export const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

/**
 * Execute a command synchronously and return output
 * @param {string} command The command to execute
 * @param {object} options Options for child_process.execSync
 * @returns {string} The command output
 */
export function execCmd(command, options = {}) {
  console.log(`${colors.yellow}Executing: ${command}${colors.reset}`);
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.stdio || 'pipe',
      ...options,
    });
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    throw error;
  }
}

/**
 * Check if a command exists in PATH
 * @param {string} command Command to check
 * @returns {boolean} True if the command exists
 */
export function hasCommand(command) {
  try {
    if (process.platform === 'win32') {
      // Windows
      execSync(`where ${command}`, { stdio: 'ignore' });
    } else {
      // Unix-like
      execSync(`which ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get tokens from environment variables
 * @returns {Object} Object with token key-value pairs
 */
export function getTokensFromEnv() {
  return {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    SONAR_TOKEN: process.env.SONAR_TOKEN || '',
    CODECOV_TOKEN: process.env.CODECOV_TOKEN || '',
    SNYK_TOKEN: process.env.SNYK_TOKEN || '',
  };
}

/**
 * Ensure artifacts directory exists
 * @param {string} rootDir Root directory of the project
 * @param {Object} deps Dependencies (for testing)
 * @returns {string} Path to the artifacts directory
 */
export function ensureArtifactsDir(rootDir, deps = {}) {
  const { fs: fsModule = fs } = deps;
  const artifactsDir = path.join(rootDir, 'artifacts');

  if (!fsModule.existsSync(artifactsDir)) {
    fsModule.mkdirSync(artifactsDir, { recursive: true });
    console.log(`${colors.green}Created artifacts directory: ${artifactsDir}${colors.reset}`);
  }

  return artifactsDir;
}

/**
 * Create a temporary directory for act workspace
 * @param {Object} deps Dependencies (for testing)
 * @returns {string} Path to the temporary directory
 */
export function createTempDir(deps = {}) {
  const { fs: fsModule = fs, os: osModule = os } = deps;

  const tempDir = fsModule.mkdtempSync(path.join(osModule.tmpdir(), 'act-workspace-'));
  console.log(`${colors.green}Creating temporary workspace in ${tempDir}${colors.reset}`);

  return tempDir;
}

/**
 * Copy files from project root to temporary directory
 * @param {string} rootDir Root directory of the project
 * @param {string} tempDir Temporary directory path
 * @param {Object} deps Dependencies (for testing)
 */
export function copyFilesToTempDir(rootDir, tempDir, deps = {}) {
  const { execSync: execSyncFn = execSync, hasCommand: hasCommandFn = hasCommand } = deps;

  console.log(
    `${colors.green}Running act from temporary workspace (excluding node_modules)${colors.reset}`
  );

  // Copy necessary files (excluding node_modules) using rsync or robocopy
  if (process.platform === 'win32') {
    // Windows - use robocopy or xcopy
    if (hasCommandFn('robocopy')) {
      execSyncFn(
        `robocopy "${rootDir}" "${tempDir}" /E /XD node_modules *\\node_modules /NFL /NDL /NJH /NJS`,
        { stdio: 'inherit' }
      );
    } else {
      execSyncFn(`xcopy "${rootDir}" "${tempDir}" /E /I /Y /EXCLUDE:node_modules`, {
        stdio: 'inherit',
      });
    }
  } else {
    // Unix-like - use rsync
    execSyncFn(
      `rsync -a --exclude="node_modules" --exclude="**/node_modules" ${rootDir}/ ${tempDir}/`,
      { stdio: 'inherit' }
    );
  }

  return tempDir;
}

/**
 * Builds the act command with all necessary arguments
 * @param {Object} tokens Key-value pairs of tokens to be added as secrets
 * @param {string} tempDir Temporary directory path where act will run
 * @param {string[]} args Additional arguments to pass to act
 * @returns {string[]} Array of command parts
 */
export function buildActCommand(tokens = {}, tempDir, args = []) {
  const cmd = ['act'];

  // Add args passed to the script
  if (args.length > 0) {
    cmd.push(...args);
  }

  // Add secrets if available
  Object.entries(tokens).forEach(([key, value]) => {
    if (value) {
      cmd.push('-s', `${key}=${value}`);
    }
  });

  // Add directories to mount
  cmd.push(
    '-C',
    tempDir,
    '--artifact-server-path',
    './artifacts',
    '-P',
    'ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest'
  );

  return cmd;
}

/**
 * Main function to run GitHub Actions locally using act
 * @param {string[]} args Command-line arguments
 * @param {Object} deps Dependencies (for testing)
 * @returns {Promise<boolean>} True if act exited successfully, false otherwise
 */
export default async function runAct(args = process.argv.slice(2), deps = {}) {
  const {
    fs: fsModule = fs,
    os: osModule = os,
    execSync: execSyncFn = execSync,
    spawn: spawnFn = spawn,
    path: pathModule = path,
    hasCommand: hasCommandFn = hasCommand,
  } = deps;

  try {
    // Get the directory name for the current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = pathModule.dirname(__filename);
    const rootDir = pathModule.resolve(__dirname, '../..');

    // Store current Node.js version
    const currentNodeVersion = execCmd('node -v', { stdio: 'pipe' }).trim();
    console.log(`${colors.blue}Current Node.js version: ${currentNodeVersion}${colors.reset}`);

    // Create artifacts directory if it doesn't exist
    ensureArtifactsDir(rootDir, { fs: fsModule });

    // Get tokens from environment variables
    const tokens = getTokensFromEnv();

    // Create a temporary directory
    const tempDir = createTempDir({ fs: fsModule, os: osModule });

    // Copy files to temporary directory
    copyFilesToTempDir(rootDir, tempDir, {
      execSync: execSyncFn,
      hasCommand: hasCommandFn,
    });

    // Build the act command
    const cmd = buildActCommand(tokens, tempDir, args);
    const cmdForDisplay = buildActCommand(
      Object.fromEntries(Object.entries(tokens).map(([key, value]) => [key, value ? '***' : ''])),
      tempDir,
      args
    );

    // Print command (without tokens)
    console.log(`${colors.blue}Command: ${cmdForDisplay.join(' ')}${colors.reset}`);

    // Run act with all the arguments
    const result = await new Promise((resolve, reject) => {
      const actProcess = spawnFn('act', cmd.slice(1), {
        stdio: 'inherit',
        shell: true,
      });

      actProcess.on('error', error => {
        console.error(`${colors.red}Failed to start act: ${error.message}${colors.reset}`);
        reject(error);
      });

      actProcess.on('close', code => {
        if (code === 0) {
          resolve(true);
        } else {
          console.error(`${colors.red}act exited with code ${code}${colors.reset}`);
          resolve(false);
        }
      });
    });

    // Clean up temporary directory
    console.log(`${colors.green}Cleaning up temporary workspace${colors.reset}`);
    fsModule.rmSync(tempDir, { recursive: true, force: true });

    // Restore Node.js version if it changed
    const afterNodeVersion = execCmd('node -v', { stdio: 'pipe' }).trim();
    if (currentNodeVersion !== afterNodeVersion) {
      console.log(
        `${colors.yellow}Node.js version changed during act execution. Restoring to ${currentNodeVersion}...${colors.reset}`
      );
      try {
        // Try to use nvm to restore the version
        execCmd(`nvm use ${currentNodeVersion.replace('v', '')}`, {
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            // Enable nvm to work in the script
            NVM_DIR: process.env.NVM_DIR || `${osModule.homedir()}/.nvm`,
          },
        });
      } catch (error) {
        console.error(
          `${colors.red}Failed to restore Node.js version: ${error.message}${colors.reset}`
        );
      }
    }

    return result;
  } catch (error) {
    console.error(`${colors.red}Error running act: ${error.message}${colors.reset}`);
    return false;
  }
}
