import fs from 'fs';
import path from 'path';
import { execSync as defaultExecSync } from 'child_process';

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
function exec(execSync, command, options = {}) {
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
function getRequiredNodeVersion() {
  try {
    return fs.readFileSync('.nvmrc', 'utf-8').trim();
  } catch (error) {
    console.error(
      `${colors.red}Error: Could not read .nvmrc file.${colors.reset}`
    );
    process.exit(1);
  }
}

/**
 * Gets the current Node.js version number
 * @param {Function} execSync Function to execute commands
 * @returns {string} Current Node.js version
 */
function getCurrentNodeVersion(execSync) {
  try {
    const nodeVersion = execSync('node -v', {
      stdio: 'pipe',
      encoding: 'utf-8',
    }).trim();
    return nodeVersion.replace('v', '').split('.')[0]; // Extract major version
  } catch (error) {
    console.error(
      `${colors.red}Error: Could not determine current Node.js version.${colors.reset}`
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
function checkNodeVersionMatch(requiredVersion, currentVersion, force = false) {
  if (currentVersion !== requiredVersion && !force) {
    console.error(
      `${colors.red}Error: This project requires Node.js version ${requiredVersion}, but you are using v${currentVersion}.${colors.reset}`
    );
    console.log(
      `Please run: ${colors.yellow}npm run fix-node-version${colors.reset}`
    );
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

  console.log(
    `${colors.green}✓ Using correct Node.js version: v${currentVersion}${colors.reset}`
  );
  return true;
}

/**
 * Performs a deep clean of the project
 * @param {string[]} args Command line arguments
 * @param {Function} execSync Function to execute commands
 */
export function cleanDeep(args = [], execSync = defaultExecSync) {
  // Parse command line arguments
  let dryRun = false;
  let force = false;

  for (const arg of args) {
    if (arg === '--help') {
      console.log(`${colors.green}Thanos Deep Clean Script${colors.reset}`);
      console.log(
        'This script performs a deep clean of the project, removing all generated files and reinstalling dependencies.'
      );
      console.log();
      console.log('Usage: npm run clean:deep [options]');
      console.log();
      console.log('Options:');
      console.log('  --help      Show this help message');
      console.log(
        '  --dry-run   Show what would be done without making any changes'
      );
      console.log(
        '  --force     Bypass the Node.js version check (not recommended)'
      );
      console.log();
      console.log('Example:');
      console.log('  npm run clean:deep -- --dry-run');
      console.log();
      process.exit(0);
    } else if (arg === '--dry-run') {
      dryRun = true;
      console.log(
        `${colors.yellow}Running in dry-run mode. No changes will be made.${colors.reset}`
      );
    } else if (arg === '--force') {
      force = true;
      console.log(
        `${colors.yellow}Force mode enabled. Will bypass Node.js version check.${colors.reset}`
      );
    }
  }

  // Check Node.js version
  console.log(`${colors.yellow}Checking Node.js version...${colors.reset}`);
  const requiredNodeVersion = getRequiredNodeVersion();
  const currentNodeVersion = getCurrentNodeVersion(execSync);
  checkNodeVersionMatch(requiredNodeVersion, currentNodeVersion, force);

  // Start deep clean
  console.log(`\n${colors.yellow}🧹 Starting deep clean...${colors.reset}`);

  // Step 1: Remove directories and files
  console.log(
    `\n${colors.yellow}Step 1: Removing generated files and directories...${colors.reset}`
  );
  if (dryRun) {
    console.log(
      'Would remove: node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs'
    );
  } else {
    exec(
      execSync,
      'rm -rf node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs'
    );
    console.log(
      `${colors.green}✓ Removed generated files and directories${colors.reset}`
    );
  }

  // Step 2: Clean npm cache
  console.log(`\n${colors.yellow}Step 2: Cleaning npm cache...${colors.reset}`);
  if (dryRun) {
    console.log('Would run: npm cache clean --force');
  } else {
    exec(execSync, 'npm cache clean --force');
    console.log(`${colors.green}✓ Cleaned npm cache${colors.reset}`);
  }

  // Step 3: Clear Jest cache
  console.log(
    `\n${colors.yellow}Step 3: Clearing Jest cache...${colors.reset}`
  );
  if (dryRun) {
    console.log('Would run: npx jest --clearCache');
  } else {
    try {
      exec(execSync, 'npx jest --clearCache');
    } catch (error) {
      // Jest cache clear might fail if Jest is not installed
      console.log(
        `${colors.yellow}⚠️ Jest cache clear might have failed, continuing...${colors.reset}`
      );
    }
    console.log(`${colors.green}✓ Cleared Jest cache${colors.reset}`);
  }

  // Step 4: Display Node.js and npm versions
  console.log(
    `\n${colors.yellow}Step 4: Checking environment...${colors.reset}`
  );
  console.log(
    `Using Node.js v${currentNodeVersion} and npm ${exec(execSync, 'npm -v', { stdio: 'pipe' }).trim()}`
  );

  // Step 5: Install dependencies
  console.log(
    `\n${colors.yellow}Step 5: Installing dependencies...${colors.reset}`
  );
  if (dryRun) {
    console.log('Would run: npm install');
  } else {
    exec(execSync, 'npm install');
    console.log(`${colors.green}✓ Installed dependencies${colors.reset}`);
  }

  // Step 6: Completion
  console.log(
    `\n${colors.green}✅ Deep cleaning complete. Environment reset to a clean state.${colors.reset}`
  );
}

/**
 * Checks that Node.js version is consistent across configuration files
 * @param {Function} execSync Function to execute commands
 */
export function checkNodeVersion(execSync = defaultExecSync) {
  console.log(
    `${colors.yellow}Checking Node.js version consistency...${colors.reset}`
  );

  // Get required Node.js version from .nvmrc
  const requiredVersion = getRequiredNodeVersion();

  // Check package.json
  console.log(`\n${colors.yellow}Checking package.json...${colors.reset}`);
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
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
    console.log(
      `${colors.green}✅ package.json Node.js version matches .nvmrc${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}❌ Error: Could not read package.json: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }

  // Check GitHub Actions workflow files
  console.log(
    `\n${colors.yellow}Checking GitHub Actions workflows...${colors.reset}`
  );
  const workflowDir = '.github/workflows';

  if (fs.existsSync(workflowDir)) {
    const workflowFiles = fs.readdirSync(workflowDir);

    for (const file of workflowFiles) {
      const filePath = path.join(workflowDir, file);

      if (
        fs.statSync(filePath).isFile() &&
        (file.endsWith('.yml') || file.endsWith('.yaml'))
      ) {
        const content = fs.readFileSync(filePath, 'utf-8');
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
            console.log(
              `${colors.green}✅ ${file} Node.js version matches .nvmrc${colors.reset}`
            );
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
    console.log(
      `${colors.yellow}ℹ️ No GitHub Actions workflow directory found.${colors.reset}`
    );
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
    if (fs.existsSync('$HOME/.nvm/nvm.sh')) {
      nvmSource = '$HOME/.nvm/nvm.sh';
    } else {
      // Try to use brew to find nvm
      try {
        const brewPrefix = execSync('brew --prefix nvm', {
          stdio: 'pipe',
          encoding: 'utf-8',
        }).trim();
        if (fs.existsSync(`${brewPrefix}/nvm.sh`)) {
          nvmSource = `$(brew --prefix nvm)/nvm.sh`;
        }
      } catch (error) {
        // Brew not found or nvm not installed via brew
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
};
