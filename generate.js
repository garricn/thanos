#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Get the script directory (where thanos is installed)
const scriptPath = process.argv[1];
const scriptDir = path.dirname(scriptPath);
const thanosDir = scriptDir;

// Get the target directory (where the user is running the script from)
const targetDir = process.cwd();

// Function to replace absolute paths in files
async function replaceAbsolutePaths(targetDir, projectName) {
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
      
          // Replace the project name in any paths
      const projectRegex = new RegExp(`/thanos/`, 'g');
      if (content.match(projectRegex)) {
        console.log(`  Replacing project name in ${file}`);
        content = content.replace(projectRegex, `/${projectName}/`);
        fs.writeFileSync(filePath, content);
      }
      
      // Replace "Thanos" with project name
      const nameRegex = new RegExp(`Thanos`, 'g');
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
      console.log(`  Updating title in app.tsx`);
      content = content.replace(titleRegex, `<h1 className="text-3xl font-bold mb-6">${projectName}</h1>`);
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
      console.log(`  Updating title in index.html`);
      content = content.replace(titleRegex, `<title>${projectName}</title>`);
      fs.writeFileSync(indexHtmlPath, content);
    }
  }
}

// Function to check if directory is empty or get confirmation to proceed
async function checkDirectoryAndConfirm() {
  const files = fs.readdirSync(targetDir).filter(f => !f.startsWith('.') && f !== 'node_modules');
  
  if (files.length > 0) {
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Current directory is not empty. Proceed anyway? This may overwrite existing files.',
      default: false
    }]);
    
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
      default: defaultName
    }
  ]);
  
  // Copy files from thanos template to current directory
  console.log(`Copying files from template to current directory...`);
  fs.copySync(thanosDir, targetDir, {
    filter: (src) => {
      const relativePath = path.relative(thanosDir, src);
      return !relativePath.startsWith('node_modules') && 
             !relativePath.startsWith('.git') && 
             relativePath !== 'generate.js';
    },
    overwrite: true
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
  
  // Add a start:no-daemon script
  if (packageJson.scripts) {
    packageJson.scripts['start:no-daemon'] = 'NX_DAEMON=false npm run start';
  }
  
  // Write updated package.json
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );
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
    licenseContent = licenseContent.replace(/Copyright \(c\) \d{4}/, `Copyright (c) ${currentYear}`);
    
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
  
  // Check for .prettierrc and .prettierignore
  const prettierrcPath = path.join(targetDir, '.prettierrc');
  const prettierignorePath = path.join(targetDir, '.prettierignore');
  
  if (!fs.existsSync(prettierrcPath)) {
    console.log('Creating .prettierrc file...');
    // Create a basic .prettierrc file if it doesn't exist
    fs.writeFileSync(prettierrcPath, `{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
`);
  }
  
  if (!fs.existsSync(prettierignorePath)) {
    console.log('Creating .prettierignore file...');
    // Create a basic .prettierignore file if it doesn't exist
    fs.writeFileSync(prettierignorePath, `# Add files here to ignore them from prettier formatting
/dist
/coverage
/.nx
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
    
    // Create proper .gitignore before installing dependencies
    updateGitignore(targetDir);
    
    // Install dependencies
    console.log('Installing dependencies (this may take a few minutes)...');
    execSync('npm install --legacy-peer-deps', { cwd: targetDir, stdio: 'inherit' });
    
    // Make initial commit with clean state
    console.log('Creating initial commit...');
    execSync('git add .', { cwd: targetDir });
    execSync('git commit -m "Initial commit from Thanos scaffold"', { cwd: targetDir });
    
    // Run additional setup commands
    await runSetupCommands(targetDir);
  } catch (error) {
    console.warn('Warning: Git initialization or dependency installation failed.');
    console.error(error.message);
  }
  

  // Success message
  console.log(`
✅ Project ${projectName} generated successfully!

Available commands:
  npm run start           # Run both API and web servers concurrently
  npm run start:no-daemon # Run without the NX daemon (use if you encounter daemon issues)
  nx serve web            # Run the website locally
  nx serve api            # Run the backend API server
  nx test web             # Run frontend unit tests
  nx test api             # Run backend unit tests
  nx e2e web-e2e          # Run UI tests
  npm run lint:all        # Run linting for all projects
  npm run format          # Run formatting for all files
  npm run test:all        # Run all unit and e2e tests for the project

Troubleshooting:
  If you encounter NX daemon issues, try these options:
  
  Option 1: Run without the daemon
  # Use the no-daemon script
  npm run start:no-daemon
  
  Option 2: Reset the daemon
  # Kill any running NX processes
  pkill -f "nx"
  # Remove socket files
  find /var/folders -name "d.sock" -delete
  # Reset NX
  npx nx reset

Notes:
- This project uses the --legacy-peer-deps flag to resolve dependency conflicts
  between Cypress 14.x and @nx/cypress. An .npmrc file has been created with this setting.
- Your git repository should be in a clean state. The .nx directory is gitignored.
`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
