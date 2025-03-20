// This script combines coverage reports from different workspaces
import fs from 'fs';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

// Directories to look for lcov.info files
const covDirs = [
  path.join(process.cwd(), 'coverage/apps/web'),
  path.join(process.cwd(), 'coverage/apps/api'),
];

// Create the coverage output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'coverage');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Create apps directory structure
const appsWebDir = path.join(outputDir, 'apps/web');
const appsApiDir = path.join(outputDir, 'apps/api');

if (!existsSync(appsWebDir)) {
  mkdirSync(appsWebDir, { recursive: true });
}

if (!existsSync(appsApiDir)) {
  mkdirSync(appsApiDir, { recursive: true });
}

// Copy coverage reports to the root coverage directory
let combinedLcov = '';

for (const dir of covDirs) {
  if (existsSync(dir)) {
    const lcovPath = path.join(dir, 'lcov.info');
    if (existsSync(lcovPath)) {
      const lcovContent = fs.readFileSync(lcovPath, 'utf-8');
      combinedLcov += lcovContent + '\n';

      // Copy the lcov-report directory if it exists
      const lcovReportDir = path.join(dir, 'lcov-report');
      if (existsSync(lcovReportDir)) {
        const targetDir = dir.includes('/web')
          ? path.join(outputDir, 'apps/web/lcov-report')
          : path.join(outputDir, 'apps/api/lcov-report');

        // Copy directory recursively (simple implementation)
        const copyRecursiveSync = (src, dest) => {
          const exists = fs.existsSync(src);
          const stats = exists && fs.statSync(src);
          const isDirectory = exists && stats.isDirectory();

          if (isDirectory) {
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true });
            }
            fs.readdirSync(src).forEach((childItemName) => {
              copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
              );
            });
          } else {
            fs.copyFileSync(src, dest);
          }
        };

        copyRecursiveSync(lcovReportDir, targetDir);
      }
    }
  }
}

// Write the combined lcov.info to the output directory
fs.writeFileSync(path.join(outputDir, 'lcov.info'), combinedLcov);

console.log('Combined coverage report created successfully!');
