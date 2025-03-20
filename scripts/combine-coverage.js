// This script combines coverage reports from different workspaces
import fs from 'fs';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

// Directories to look for lcov.info and sonar-report.xml files
const covDirs = [
  path.join(process.cwd(), 'coverage/api/unit'),
  path.join(process.cwd(), 'coverage/web/unit'),
  path.join(process.cwd(), 'coverage/web/snapshot'),
];

// Create the coverage output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'coverage');
const combinedDir = path.join(outputDir, 'combined');
if (!existsSync(combinedDir)) {
  mkdirSync(combinedDir, { recursive: true });
}

// Combine LCOV reports
let combinedLcov = '';
// Collect all test results for XML reports
let combinedTestResults = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let pendingTests = 0;

for (const dir of covDirs) {
  if (existsSync(dir)) {
    // Handle LCOV files
    const lcovPath = path.join(dir, 'lcov.info');
    if (existsSync(lcovPath)) {
      const lcovContent = fs.readFileSync(lcovPath, 'utf-8');
      combinedLcov += lcovContent + '\n';

      // Copy the lcov-report directory if it exists
      const lcovReportDir = path.join(dir, 'lcov-report');
      if (existsSync(lcovReportDir)) {
        const targetDir = path.join(combinedDir, 'lcov-report');

        // Copy directory recursively
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

    // Handle Sonar XML files
    const sonarPath = path.join(dir, 'sonar-report.xml');
    if (existsSync(sonarPath)) {
      try {
        const content = fs.readFileSync(sonarPath, 'utf8');
        const report = JSON.parse(content);
        if (report.testResults) {
          combinedTestResults = combinedTestResults.concat(report.testResults);
          totalTests += report.numTotalTests || 0;
          passedTests += report.numPassedTests || 0;
          failedTests += report.numFailedTests || 0;
          pendingTests += report.numPendingTests || 0;
        }
      } catch (e) {
        console.error(`Error parsing ${sonarPath}:`, e);
      }
    }
  }
}

// Write the combined LCOV file
fs.writeFileSync(path.join(combinedDir, 'lcov.info'), combinedLcov);

// Write the combined Sonar XML report
const combinedSonarReport = {
  numTotalTests: totalTests,
  numPassedTests: passedTests,
  numFailedTests: failedTests,
  numPendingTests: pendingTests,
  testResults: combinedTestResults,
};

fs.writeFileSync(
  path.join(combinedDir, 'sonar-report.xml'),
  JSON.stringify(combinedSonarReport, null, 2)
);

console.log('Combined coverage reports created successfully!');
console.log(`- LCOV report: ${path.join(combinedDir, 'lcov.info')}`);
console.log(
  `- Sonar XML report: ${path.join(combinedDir, 'sonar-report.xml')}`
);
