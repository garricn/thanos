#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
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
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

/**
 * Execute a command synchronously and return output
 * @param {string} command The command to execute
 * @param {object} options Options for child_process.execSync
 * @returns {string} The command output
 */
function execCmd(command, options = {}) {
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
 * Get a token from the system keychain (Mac only) or environment variables
 * @param {string} tokenName Name of the token
 * @returns {string} The token value or empty string
 */
function getToken(tokenName) {
  try {
    if (process.platform === 'darwin' && hasCommand('security')) {
      try {
        // Try to get from keychain
        return execCmd(
          `security find-generic-password -a "${process.env.USER}" -s ${tokenName} -w`,
          { stdio: 'pipe' }
        ).trim();
      } catch (e) {
        // If keychain access fails, fall back to environment variable
        return process.env[tokenName.toUpperCase()] || '';
      }
    } else {
      // Use environment variable
      return process.env[tokenName.toUpperCase()] || '';
    }
  } catch (error) {
    console.error(
      `${colors.yellow}Could not retrieve ${tokenName}, falling back to empty string${colors.reset}`
    );
    return '';
  }
}

/**
 * Check if a command exists in PATH
 * @param {string} command Command to check
 * @returns {boolean} True if the command exists
 */
function hasCommand(command) {
  try {
    if (process.platform === 'win32') {
      // Windows
      execCmd(`where ${command}`, { stdio: 'ignore' });
    } else {
      // Unix-like
      execCmd(`which ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main function to run GitHub Actions locally using act
 */
async function runAct() {
  try {
    // Store current Node.js version
    const currentNodeVersion = execCmd('node -v', { stdio: 'pipe' }).trim();
    console.log(
      `${colors.blue}Current Node.js version: ${currentNodeVersion}${colors.reset}`
    );

    // Create artifacts directory if it doesn't exist
    const artifactsDir = path.join(rootDir, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
      console.log(
        `${colors.green}Created artifacts directory: ${artifactsDir}${colors.reset}`
      );
    }

    // Get tokens
    const tokens = {
      GITHUB_TOKEN: getToken('github-token'),
      SONAR_TOKEN: getToken('sonar-token'),
      CODECOV_TOKEN: getToken('codecov-token'),
      SNYK_TOKEN: getToken('snyk-token'),
    };

    // Create a temporary directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'act-workspace-'));
    console.log(
      `${colors.green}Creating temporary workspace in ${tempDir}${colors.reset}`
    );

    // Copy necessary files (excluding node_modules) using rsync or robocopy
    if (process.platform === 'win32') {
      // Windows - use robocopy or xcopy
      if (hasCommand('robocopy')) {
        execCmd(
          `robocopy "${rootDir}" "${tempDir}" /E /XD node_modules *\\node_modules /NFL /NDL /NJH /NJS`,
          { stdio: 'inherit' }
        );
      } else {
        execCmd(
          `xcopy "${rootDir}" "${tempDir}" /E /I /Y /EXCLUDE:node_modules`,
          { stdio: 'inherit' }
        );
      }
    } else {
      // Unix-like - use rsync
      execCmd(
        `rsync -a --exclude="node_modules" --exclude="**/node_modules" ${rootDir}/ ${tempDir}/`,
        { stdio: 'inherit' }
      );
    }

    // Build the command array
    const cmd = ['act'];
    const cmdForDisplay = ['act'];

    // Add args passed to this script
    const args = process.argv.slice(2);
    if (args.length > 0) {
      cmd.push(...args);
      cmdForDisplay.push(...args);
    }

    // Add secrets if available
    Object.entries(tokens).forEach(([key, value]) => {
      if (value) {
        cmd.push('-s', `${key}=${value}`);
        cmdForDisplay.push('-s', `${key}=***`); // Don't show actual tokens in logs
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
    cmdForDisplay.push(
      '-C',
      tempDir,
      '--artifact-server-path',
      './artifacts',
      '-P',
      'ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest'
    );

    // Print command (without tokens)
    console.log(
      `${colors.green}Running act from temporary workspace (excluding node_modules)${colors.reset}`
    );
    console.log(
      `${colors.blue}Command: ${cmdForDisplay.join(' ')}${colors.reset}`
    );

    // Run act with all the arguments
    const result = await new Promise((resolve, reject) => {
      const actProcess = spawn('act', cmd.slice(1), {
        stdio: 'inherit',
        shell: true,
      });

      actProcess.on('error', (error) => {
        console.error(
          `${colors.red}Failed to start act: ${error.message}${colors.reset}`
        );
        reject(error);
      });

      actProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          console.error(
            `${colors.red}act exited with code ${code}${colors.reset}`
          );
          resolve(false);
        }
      });
    });

    // Clean up temporary directory
    console.log(
      `${colors.green}Cleaning up temporary workspace${colors.reset}`
    );
    fs.rmSync(tempDir, { recursive: true, force: true });

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
            NVM_DIR: process.env.NVM_DIR || `${os.homedir()}/.nvm`,
          },
        });
      } catch (error) {
        console.error(
          `${colors.red}Failed to restore Node.js version: ${error.message}${colors.reset}`
        );
        console.error(
          `${colors.yellow}You may need to manually restore your Node.js version${colors.reset}`
        );
      }
    }

    process.exit(result ? 0 : 1);
  } catch (error) {
    console.error(
      `${colors.red}Error running act: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

// Start the script
runAct();
