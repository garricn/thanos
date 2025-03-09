#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Get the current directory name (thanos)
const currentDir = path.basename(process.cwd());
const parentDir = path.dirname(process.cwd());
const currentDirFullPath = process.cwd();

// Function to replace absolute paths in files
async function replaceAbsolutePaths(targetDir, originalPath, projectName) {
  console.log('Replacing absolute paths in files...');
  
  // Files that might contain absolute paths
  const filesToCheck = [
    // Vite config files
    'vite.config.ts',
    'apps/web/vite.config.ts',
    // Nx config files
    'nx.json',
    // Cypress config files
    'apps/web/e2e/cypress.config.ts',
    // Any JSON files that might have paths
    'package.json',
    'project.json',
    'apps/web/project.json',
    'apps/api/project.json',
    // TypeScript config files
    'tsconfig.json',
    'apps/web/tsconfig.json',
    'apps/api/tsconfig.json'
  ];
  
  for (const file of filesToCheck) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace absolute paths with relative paths
      const regex = new RegExp(originalPath.replace(/\//g, '\\/').replace(/\./g, '\\.'), 'g');
      if (content.match(regex)) {
        console.log(`  Replacing paths in ${file}`);
        content = content.replace(regex, path.join(parentDir, projectName));
        fs.writeFileSync(filePath, content);
      }
      
      // Replace the project name in any paths
      const projectRegex = new RegExp(`/${currentDir}/`, 'g');
      if (content.match(projectRegex)) {
        console.log(`  Replacing project name in ${file}`);
        content = content.replace(projectRegex, `/${projectName}/`);
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
    let content = fs.readFileSync(gitignorePath, 'utf8');
    
    // Make sure .nx directory is properly ignored
    if (!content.includes('.nx/')) {
      content += '\n# Nx cache\n.nx/\n';
    }
    
    fs.writeFileSync(gitignorePath, content);
  }
}

// Function to run setup commands
async function runSetupCommands(targetDir) {
  console.log('Running setup commands...');
  
  try {
    // Create a clean .nx directory
    const nxDir = path.join(targetDir, '.nx');
    if (fs.existsSync(nxDir)) {
      fs.removeSync(nxDir);
    }
    
    // Untrack .nx directory from git
    execSync('git rm -r --cached .nx 2>/dev/null || true', { cwd: targetDir });
    
    // Add a .gitkeep file to ensure the directory exists
    fs.mkdirSync(path.join(targetDir, '.nx'), { recursive: true });
    fs.writeFileSync(path.join(targetDir, '.nx', '.gitkeep'), '');
    
    // Commit the changes
    execSync('git add .gitignore .nx/.gitkeep', { cwd: targetDir });
    execSync('git commit -m "Ensure clean git state with proper gitignore"', { cwd: targetDir });
    
    console.log('Setup commands completed successfully.');
  } catch (error) {
    console.warn('Warning: Setup commands failed. You may need to run them manually.');
    console.error(error.message);
  }
}

async function main() {
  // Prompt for project name
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your new project?',
      default: 'my-thanos'
    }
  ]);

  // Create the target directory
  const targetDir = path.join(parentDir, projectName);
  
  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${targetDir} already exists.`);
    process.exit(1);
  }
  
  // Create the directory
  fs.mkdirSync(targetDir);
  
  // Copy files, excluding node_modules, .git, and generate.js
  console.log(`Copying files to ${targetDir}...`);
  fs.copySync(process.cwd(), targetDir, {
    filter: (src) => {
      const relativePath = path.relative(process.cwd(), src);
      return !relativePath.startsWith('node_modules') && 
             !relativePath.startsWith('.git') && 
             relativePath !== 'generate.js';
    }
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
  
  // Write updated package.json
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );
  
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
    licenseContent = licenseContent.replace(/Copyright \(c\) \d{4}/, `Copyright (c) ${currentYear}`);
    
    fs.writeFileSync(licensePath, licenseContent);
  }
  
  // Replace absolute paths in files
  await replaceAbsolutePaths(targetDir, currentDirFullPath, projectName);
  
  // Ensure .gitignore exists and is properly configured
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    console.log('Creating .gitignore file...');
    // Create a basic .gitignore file if it doesn't exist
    fs.writeFileSync(gitignorePath, `# See https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files for more about ignoring files.

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

# Nx
.nx/
`);
  }
  
  // Update .gitignore
  updateGitignore(targetDir);
  
  // Create .npmrc file with legacy-peer-deps setting
  fs.writeFileSync(
    path.join(targetDir, '.npmrc'),
    'legacy-peer-deps=true\n'
  );
  
  // Initialize git repository
  try {
    console.log('Initializing Git repository...');
    execSync('git init', { cwd: targetDir });
    execSync('git add .', { cwd: targetDir });
    execSync('git commit -m "Initial commit from Thanos scaffold"', { cwd: targetDir });
    console.log('Git repository initialized with initial commit.');
    
    // Run additional setup commands
    await runSetupCommands(targetDir);
  } catch (error) {
    console.warn('Warning: Git initialization failed. You may need to initialize Git manually.');
    console.error(error.message);
  }
  
  // Success message
  console.log(`
✅ Project ${projectName} generated successfully at ${targetDir}

To get started:
  cd ${projectName}
  npm install --legacy-peer-deps
  npm run start

Available commands:
  npm run start     # Run both API and web servers concurrently
  nx serve web      # Run the website locally
  nx serve api      # Run the backend API server
  nx test web       # Run frontend unit tests
  nx test api       # Run backend unit tests
  nx e2e web-e2e    # Run UI tests
  npm run lint:all  # Run linting for all projects
  npm run format    # Run formatting for all files
  npm run test:all  # Run all unit and e2e tests

Notes:
- This project uses the --legacy-peer-deps flag to resolve dependency conflicts
  between Cypress 14.x and @nx/cypress. An .npmrc file has been created with this setting.
- If you encounter any Nx daemon issues, try running: npx nx reset
- Your git repository should be in a clean state. The .nx directory is gitignored.
`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
