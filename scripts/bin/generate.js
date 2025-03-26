#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the script directory (where thanos is installed)
const currentFilePath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(currentFilePath);
const thanosDir = scriptDir;

// Get the target directory (where the user is running the script from)
const targetDir = process.cwd();

// Function to replace absolute paths in files
async function replaceAbsolutePaths(targetDir, projectName) {
  console.log('Replacing absolute paths in files...');

  // Files that might contain absolute paths
  const configFiles = [
    'apps/api/vitest.config.ts',
    'apps/web/vitest.config.ts',
    'apps/web/playwright.config.ts',
    'scripts/vitest.config.js',
    'vite.config.ts',
    'vitest.workspace.ts',
  ];

  for (const file of configFiles) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace the project name in any paths
      const projectRegex = new RegExp('/thanos/', 'g');
      if (content.match(projectRegex)) {
        console.log(`  Replacing project name in ${file}`);
        content = content.replace(projectRegex, `/${projectName}/`);
        fs.writeFileSync(filePath, content);
      }

      // Replace "Thanos" with project name
      const nameRegex = new RegExp('Thanos', 'g');
      if (content.match(nameRegex)) {
        console.log(`  Replacing "Thanos" with "${projectName}" in ${file}`);
        content = content.replace(nameRegex, projectName);
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

// Function to update .gitignore
function updateGitignore(targetDir) {
  console.log('Updating .gitignore...');
  const gitignorePath = path.join(targetDir, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    fs.writeFileSync(gitignorePath, content);
  }
}

// Function to run setup commands
async function runSetupCommands(targetDir) {
  console.log('Running setup commands...');

  try {
    // Commit the changes to ensure clean git state
    execSync('git add .gitignore', { cwd: targetDir });
    execSync('git commit -m "Ensure clean git state with proper gitignore"', {
      cwd: targetDir,
    });

    console.log('Setup commands completed successfully.');
  } catch (error) {
    console.warn('Warning: Setup commands failed. You may need to run them manually.');
    console.error(error.message);
  }
}

// Function to update app title in React components
async function updateAppTitle(targetDir, projectName) {
  console.log('Updating app title in React components...');

  // Update title in app.tsx
  const appTsxPath = path.join(targetDir, 'apps/web/src/app/app.tsx');
  if (fs.existsSync(appTsxPath)) {
    let content = fs.readFileSync(appTsxPath, 'utf8');

    // Replace "Web App" with project name
    const titleRegex = /<h1[^>]*>Web App<\/h1>/;
    if (content.match(titleRegex)) {
      console.log('  Updating title in app.tsx');
      content = content.replace(
        titleRegex,
        `<h1 className="text-3xl font-bold mb-6">${projectName}</h1>`
      );
      fs.writeFileSync(appTsxPath, content);
    }
  }

  // Update title in index.html
  const indexHtmlPath = path.join(targetDir, 'apps/web/index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let content = fs.readFileSync(indexHtmlPath, 'utf8');

    // Replace "Thanos" with project name in title tag
    const titleRegex = /<title>Thanos<\/title>/;
    if (content.match(titleRegex)) {
      console.log('  Updating title in index.html');
      content = content.replace(titleRegex, `<title>${projectName}</title>`);
      fs.writeFileSync(indexHtmlPath, content);
    }
  }
}

// Function to check if directory is empty or get confirmation to proceed
async function checkDirectoryAndConfirm() {
  const files = fs.readdirSync(targetDir).filter(f => !f.startsWith('.') && f !== 'node_modules');

  if (files.length > 0) {
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message:
          'Current directory is not empty. Proceed anyway? This may overwrite existing files.',
        default: false,
      },
    ]);

    if (!proceed) {
      console.log('Operation cancelled.');
      process.exit(0);
    }
  }
}

async function main() {
  // Check if current directory is empty or get confirmation
  await checkDirectoryAndConfirm();

  // Prompt for project name (default to current directory name)
  const defaultName = path.basename(targetDir);
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: defaultName,
    },
  ]);

  // Copy files from thanos template to current directory
  console.log('Copying files from template to current directory...');
  fs.copySync(thanosDir, targetDir, {
    filter: src => {
      const relativePath = path.relative(thanosDir, src);
      return (
        !relativePath.startsWith('node_modules') &&
        !relativePath.startsWith('.git') &&
        relativePath !== 'generate.js'
      );
    },
    overwrite: true,
  });

  // Update package.json
  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update name
  packageJson.name = projectName;

  // Remove inquirer from devDependencies
  if (packageJson.devDependencies && packageJson.devDependencies.inquirer) {
    delete packageJson.devDependencies.inquirer;
  }

  // Remove generate script
  if (packageJson.scripts && packageJson.scripts.generate) {
    delete packageJson.scripts.generate;
  }

  // Add npm scripts
  packageJson.scripts['start'] =
    'concurrently --kill-others-on-fail "npm run start:api" "npm run start:web"';
  packageJson.scripts['start:api'] = 'npm run dev --workspace=apps/api';
  packageJson.scripts['start:web'] = 'npm run dev --workspace=apps/web';

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with project name and added start:no-daemon script');

  // Update README.md
  const readmePath = path.join(targetDir, 'README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // Replace project name in README
  readmeContent = readmeContent.replace(/# Thanos/g, `# ${projectName}`);
  readmeContent = readmeContent.replace(/thanos\//g, `${projectName}/`);

  fs.writeFileSync(readmePath, readmeContent);

  // Update LICENSE file with current year
  const licensePath = path.join(targetDir, 'LICENSE');
  if (fs.existsSync(licensePath)) {
    let licenseContent = fs.readFileSync(licensePath, 'utf8');
    const currentYear = new Date().getFullYear();

    // Update copyright year
    licenseContent = licenseContent.replace(
      /Copyright \(c\) \d{4}/,
      `Copyright (c) ${currentYear}`
    );

    fs.writeFileSync(licensePath, licenseContent);
  }

  // Replace paths and update names
  await replaceAbsolutePaths(targetDir, projectName);

  // Update app title in React components
  await updateAppTitle(targetDir, projectName);

  // Ensure all important hidden files exist
  console.log('Checking for important hidden files...');

  // .gitignore
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    console.log('Creating .gitignore file...');
    fs.writeFileSync(
      gitignorePath,
      `# See https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files for more about ignoring files.

# compiled output
dist
tmp
out-tsc

# dependencies
node_modules

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db
`
    );
  }

  // Check for .prettierrc and .prettierignore
  const prettierrcPath = path.join(targetDir, '.prettierrc');
  const prettierignorePath = path.join(targetDir, '.prettierignore');

  if (!fs.existsSync(prettierrcPath)) {
    console.log('Creating .prettierrc file...');
    // Create a basic .prettierrc file if it doesn't exist
    fs.writeFileSync(
      prettierrcPath,
      `{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
`
    );
  }

  if (!fs.existsSync(prettierignorePath)) {
    console.log('Creating .prettierignore file...');
    // Create a basic .prettierignore file if it doesn't exist
    fs.writeFileSync(
      prettierignorePath,
      `# Add files here to ignore them from prettier formatting
/dist
/coverage
`
    );
  }

  // Update .gitignore
  updateGitignore(targetDir);

  // Create .npmrc file with legacy-peer-deps setting
  fs.writeFileSync(path.join(targetDir, '.npmrc'), 'legacy-peer-deps=true\n');

  // Initialize git repository
  try {
    console.log('Initializing Git repository...');
    execSync('git init', { cwd: targetDir });

    // Create proper .gitignore before installing dependencies
    updateGitignore(targetDir);

    // Install dependencies
    console.log('Installing dependencies (this may take a few minutes)...');
    execSync('npm install --legacy-peer-deps', {
      cwd: targetDir,
      stdio: 'inherit',
    });

    // Make initial commit with clean state
    console.log('Creating initial commit...');
    execSync('git add .', { cwd: targetDir });
    execSync('git commit -m "Initial commit from Thanos scaffold"', {
      cwd: targetDir,
    });

    // Run additional setup commands
    await runSetupCommands(targetDir);
  } catch (error) {
    console.warn('Warning: Git initialization or dependency installation failed.');
    console.error(error.message);
  }

  // Success message
  console.log(`
Success! Your project is ready.

To start developing:
  # Navigate to the project directory
  cd ${path.basename(targetDir)}
  
  # Install dependencies
  npm install
  
  # Start the development servers
  npm start
  
  # Run tests
  npm test

Other useful commands:
  npm run build             # Build the project for production
  npm run test:all          # Run all tests (unit + e2e)
  npm run lint              # Check code for linting issues
  npm run format            # Format code with prettier

If you encounter any issues:
  # Clean the project (removes build artifacts and caches)
  npm run clean:deep
  # Install dependencies again
  npm install

Notes:
- This project uses the --legacy-peer-deps flag to resolve dependency conflicts
  between packages. An .npmrc file has been created with this setting.
- Your git repository should be in a clean state.
`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
