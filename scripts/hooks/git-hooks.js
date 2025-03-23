import { execSync as defaultExecSync } from 'child_process';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * Executes a command and returns its output
 * @param {Function} execSync Function to execute commands
 * @param {string} command Command to execute
 * @param {object} options Options for execSync
 * @returns {string} Command output
 */
function exec(execSync, command, options = {}) {
  const defaultOptions = {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  };

  return execSync(command, defaultOptions);
}

/**
 * Gets staged TypeScript files, handling the case where grep returns non-zero
 * @param {Function} execSync Function to execute commands
 * @returns {string} List of staged TypeScript files
 */
function getStagedTypeScriptFiles(execSync) {
  try {
    return execSync('git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$', {
      stdio: 'pipe',
      encoding: 'utf-8',
    }).trim();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // grep returns 1 if no matches are found
    return '';
  }
}

/**
 * Runs pre-commit checks including formatting, linting, and type checking
 * @param {Function} execSync Function to execute commands (optional, defaults to child_process.execSync)
 */
export async function runPreCommitChecks(execSync = defaultExecSync) {
  console.log(`${colors.yellow}Running pre-commit checks...${colors.reset}`);

  try {
    // Run lint-staged
    console.log(`${colors.yellow}\nRunning lint-staged...${colors.reset}`);
    exec(execSync, 'npx lint-staged');

    // Get staged TypeScript files
    const files = getStagedTypeScriptFiles(execSync);
    if (files) {
      console.log(`${colors.yellow}\nType checking staged TypeScript files...${colors.reset}`);
      exec(execSync, `npx tsc --noEmit ${files}`);
    }

    console.log(`${colors.green}\n✅ All pre-commit checks passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}\n❌ ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Runs pre-push checks including Node version, type checking, linting, and unit tests
 * @param {Function} execSync Function to execute commands (optional, defaults to child_process.execSync)
 */
export async function runPrePushChecks(execSync = defaultExecSync) {
  console.log(`${colors.yellow}Running pre-push checks...${colors.reset}`);

  try {
    // Check Node.js version
    console.log(`${colors.yellow}\nChecking Node.js version...${colors.reset}`);
    exec(execSync, 'npm run node:version');

    // Run type checking
    console.log(`${colors.yellow}\nRunning type check...${colors.reset}`);
    exec(execSync, 'npm run type-check');

    // Run linting
    console.log(`${colors.yellow}\nRunning linters...${colors.reset}`);
    exec(execSync, 'npm run lint');

    // Run unit tests
    console.log(`${colors.yellow}\nRunning unit tests...${colors.reset}`);
    exec(execSync, 'npm run test:unit');

    console.log(`${colors.green}\n✅ All pre-push checks passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}\n❌ ${error.message}${colors.reset}`);
    throw error;
  }
}
