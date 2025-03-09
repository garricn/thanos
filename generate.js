#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Get the current directory name (thanos)
const currentDir = path.basename(process.cwd());
const parentDir = path.dirname(process.cwd());

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
  
  // Initialize git repository
  try {
    console.log('Initializing Git repository...');
    execSync('git init', { cwd: targetDir });
    execSync('git add .', { cwd: targetDir });
    execSync('git commit -m "Initial commit from Thanos scaffold"', { cwd: targetDir });
    console.log('Git repository initialized with initial commit.');
  } catch (error) {
    console.warn('Warning: Git initialization failed. You may need to initialize Git manually.');
    console.error(error.message);
  }
  
  // Success message
  console.log(`
✅ Project ${projectName} generated successfully at ${targetDir}

To get started:
  cd ${projectName}
  npm install
  npm start

Available commands:
  npm start         # Run both API and web servers concurrently
  nx serve web      # Run the website locally
  nx serve api      # Run the backend API server
  nx test web       # Run frontend unit tests
  nx test api       # Run backend unit tests
  nx e2e web-e2e    # Run UI tests
  npm run lint:all  # Run linting for all projects
  npm run format    # Run formatting for all files
  npm run test:all  # Run all unit and e2e tests
`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
