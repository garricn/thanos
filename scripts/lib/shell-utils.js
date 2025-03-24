import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { execSync as defaultExecSync } from 'node:child_process';

// ANSI color codes
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
export function exec(execSync, command, options = {}) {
  const defaultOptions = {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  };

  return execSync(command, defaultOptions);
}

/**
 * Gets the Node.js version from .nvmrc
 * @returns {string} Node.js version number
 */
export function getRequiredNodeVersion() {
  try {
    return readFileSync('.nvmrc', 'utf-8').trim();
  } catch (err) {
    console.error(`${colors.red}Error: Could not read .nvmrc file: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Gets the current Node.js version number
 * @param {Function} execSync Function to execute commands
 * @returns {string} Current Node.js version
 */
export function getCurrentNodeVersion(execSync) {
  try {
    const nodeVersion = execSync('node -v', {
      stdio: 'pipe',
      encoding: 'utf-8',
    }).trim();
    return nodeVersion.replace('v', '').split('.')[0]; // Extract major version
  } catch (err) {
    console.error(
      `${colors.red}Error: Could not determine current Node.js version: ${err.message}${colors.reset}`
    );
    process.exit(1);
  }
}

/**
 * Check if the current Node.js version matches the required version
 * @param {string} requiredVersion Required Node.js version from .nvmrc
 * @param {string} currentVersion Current Node.js version
 * @param {boolean} force Whether to bypass version check
 * @returns {boolean} True if versions match or force is true
 */
export function checkNodeVersionMatch(requiredVersion, currentVersion, force = false) {
  if (currentVersion !== requiredVersion && !force) {
    console.error(
      `${colors.red}Error: This project requires Node.js version ${requiredVersion}, but you are using v${currentVersion}.${colors.reset}`
    );
    console.log(`Please run: ${colors.yellow}npm run fix-node-version${colors.reset}`);
    console.log(
      `Or use ${colors.yellow}--force${colors.reset} to bypass this check (not recommended).`
    );
    process.exit(1);
  }

  if (currentVersion !== requiredVersion) {
    console.log(
      `${colors.yellow}⚠️ Warning: Using Node.js v${currentVersion} instead of the recommended v${requiredVersion}${colors.reset}`
    );
    return false;
  }

  console.log(`${colors.green}✓ Using correct Node.js version: v${currentVersion}${colors.reset}`);
  return true;
}

/**
 * Performs a deep clean of the project
 * @param {object} options Options for the clean operation
 * @param {Function} options.execSync Function to execute commands
 * @param {object} options.console Console object for logging
 * @param {object} options.colors Color codes for console output
 * @param {boolean} options.dryRun Whether to perform a dry run
 */
export async function cleanDeep(options = {}) {
  const {
    execSync = defaultExecSync,
    console = globalThis.console,
    colors: customColors = colors,
    dryRun = false,
  } = options;

  // Step 1: Clean node_modules
  console.log(`\n${customColors.yellow}Step 1: Cleaning node_modules...${customColors.reset}`);
  if (dryRun) {
    console.log('Would run: rm -rf node_modules');
  } else {
    exec(execSync, 'rm -rf node_modules');
  }
  console.log(`${customColors.green}✓ Cleaned node_modules${customColors.reset}`);

  // Step 2: Clean build artifacts
  console.log(`\n${customColors.yellow}Step 2: Cleaning build artifacts...${customColors.reset}`);
  if (dryRun) {
    console.log('Would run: rm -rf dist tmp coverage');
  } else {
    exec(execSync, 'rm -rf dist tmp coverage');
  }
  console.log(`${customColors.green}✓ Cleaned build artifacts${customColors.reset}`);

  // Step 3: Clean npm cache
  console.log(`\n${customColors.yellow}Step 3: Cleaning npm cache...${customColors.reset}`);
  if (dryRun) {
    console.log('Would run: npm cache clean --force');
  } else {
    exec(execSync, 'npm cache clean --force');
  }
  console.log(`${customColors.green}✓ Cleaned npm cache${customColors.reset}`);

  console.log(`\n${customColors.green}✓ Deep clean completed successfully${customColors.reset}`);
}

/**
 * Checks that Node.js version is consistent across configuration files
 */
export function checkNodeVersion() {
  console.log(`${colors.yellow}Checking Node.js version consistency...${colors.reset}`);

  // Get required Node.js version from .nvmrc
  const requiredVersion = getRequiredNodeVersion();

  // Check package.json
  console.log(`\n${colors.yellow}Checking package.json...${colors.reset}`);
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    if (!packageJson.engines || !packageJson.engines.node) {
      console.error(
        `${colors.red}❌ Error: No Node.js version specified in package.json engines field${colors.reset}`
      );
      process.exit(1);
    }

    const packageNodeVersion = packageJson.engines.node;
    if (packageNodeVersion !== requiredVersion) {
      console.error(
        `${colors.red}❌ Error: Node.js version in package.json (${packageNodeVersion}) does not match .nvmrc (${requiredVersion})${colors.reset}`
      );
      console.log(
        `${colors.yellow}    Please update package.json to use version from .nvmrc${colors.reset}`
      );
      process.exit(1);
    }
    console.log(`${colors.green}✅ package.json Node.js version matches .nvmrc${colors.reset}`);
  } catch (error) {
    console.error(
      `${colors.red}❌ Error: Could not read package.json: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }

  // Check GitHub Actions workflow files
  console.log(`\n${colors.yellow}Checking GitHub Actions workflows...${colors.reset}`);
  const workflowDir = '.github/workflows';

  if (existsSync(workflowDir)) {
    const workflowFiles = readdirSync(workflowDir);

    for (const file of workflowFiles) {
      const filePath = path.join(workflowDir, file);

      if (existsSync(filePath) && (file.endsWith('.yml') || file.endsWith('.yaml'))) {
        const content = readFileSync(filePath, 'utf-8');
        if (content.includes('node-version:')) {
          // Simple regex to extract Node.js version from workflow file
          const matches = content.match(/node-version:\s*([0-9]+)/);
          if (matches && matches[1]) {
            const workflowNodeVersion = matches[1];
            if (workflowNodeVersion !== requiredVersion) {
              console.error(
                `${colors.red}❌ Error: Node.js version in ${file} (${workflowNodeVersion}) does not match .nvmrc (${requiredVersion})${colors.reset}`
              );
              console.log(
                `${colors.yellow}    Please update ${file} to use version from .nvmrc${colors.reset}`
              );
              process.exit(1);
            }
            console.log(`${colors.green}✅ ${file} Node.js version matches .nvmrc${colors.reset}`);
          } else {
            console.log(
              `${colors.yellow}ℹ️ ${file} contains node-version but couldn't extract version number. Please check manually.${colors.reset}`
            );
          }
        } else {
          console.log(
            `${colors.yellow}ℹ️ ${file} does not specify a Node.js version directly. Skipping check.${colors.reset}`
          );
        }
      }
    }
  } else {
    console.log(`${colors.yellow}ℹ️ No GitHub Actions workflow directory found.${colors.reset}`);
  }

  console.log(
    `\n${colors.green}✅ All Node.js version references are in sync with .nvmrc${colors.reset}`
  );
}

/**
 * Switches to the Node.js version specified in .nvmrc
 * @param {Function} execSync Function to execute commands
 */
export function switchNodeVersion(execSync = defaultExecSync) {
  const requiredVersion = getRequiredNodeVersion();
  console.log(`Switching to Node.js ${requiredVersion}...`);

  let nvmSource = '';

  try {
    // Try to find nvm
    if (existsSync('$HOME/.nvm/nvm.sh')) {
      nvmSource = '$HOME/.nvm/nvm.sh';
    } else {
      // Try to use brew to find nvm
      try {
        const brewPrefix = execSync('brew --prefix nvm', {
          stdio: 'pipe',
          encoding: 'utf-8',
        }).trim();
        if (existsSync(`${brewPrefix}/nvm.sh`)) {
          nvmSource = '$(brew --prefix nvm)/nvm.sh';
        }
      } catch (err) {
        // Brew not found or nvm not installed via brew
        console.log(`${colors.yellow}Note: Brew command failed: ${err.message}${colors.reset}`);
      }
    }

    if (!nvmSource) {
      console.error(
        `${colors.red}Error: Could not find nvm. Please install nvm or switch to Node.js ${requiredVersion} manually.${colors.reset}`
      );
      process.exit(1);
    }

    // Switch to the required Node.js version
    exec(execSync, `source ${nvmSource} && nvm use ${requiredVersion}`);

    // Verify the switch was successful
    const currentVersion = getCurrentNodeVersion(execSync);
    if (currentVersion === requiredVersion) {
      console.log(
        `${colors.green}✅ Successfully switched to Node.js v${currentVersion}${colors.reset}`
      );
    } else {
      console.error(
        `${colors.red}❌ Failed to switch to Node.js ${requiredVersion}. Current version: v${currentVersion}${colors.reset}`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Export functions for CLI usage
export default {
  cleanDeep,
  checkNodeVersion,
  switchNodeVersion,
  exec,
  // Export internal functions for testing
  getRequiredNodeVersion,
  getCurrentNodeVersion,
  checkNodeVersionMatch,
};
