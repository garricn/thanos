#!/usr/bin/env node

/**
 * This script handles cleanup and standardization of test report files.
 * It ensures that:
 * 1. If test-report.xml exists at root, it's copied to coverage/sonar-report.xml
 * 2. After copying, the root test-report.xml is removed to avoid confusion
 */

const fs = require('fs');
const path = require('path');

const ROOT_REPORT = 'test-report.xml';
const COVERAGE_DIR = 'coverage';
const TARGET_REPORT = path.join(COVERAGE_DIR, 'sonar-report.xml');

console.log('Starting test report cleanup...');

// Check if test-report.xml exists at root
if (fs.existsSync(ROOT_REPORT)) {
  console.log(`Found ${ROOT_REPORT} at root level`);

  // Ensure coverage directory exists
  if (!fs.existsSync(COVERAGE_DIR)) {
    console.log(`Creating ${COVERAGE_DIR} directory`);
    fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  }

  // Copy the file to the correct location
  console.log(`Copying ${ROOT_REPORT} to ${TARGET_REPORT}`);
  fs.copyFileSync(ROOT_REPORT, TARGET_REPORT);

  // Validate the copied file
  if (fs.existsSync(TARGET_REPORT)) {
    const stats = fs.statSync(TARGET_REPORT);
    console.log(`Report file copied successfully. Size: ${stats.size} bytes`);

    // Remove the root file
    console.log(`Removing ${ROOT_REPORT} from root`);
    fs.unlinkSync(ROOT_REPORT);

    if (!fs.existsSync(ROOT_REPORT)) {
      console.log(`${ROOT_REPORT} successfully removed from root`);
    } else {
      console.error(`Failed to remove ${ROOT_REPORT} from root`);
    }
  } else {
    console.error(`Failed to copy ${ROOT_REPORT} to ${TARGET_REPORT}`);
  }
} else {
  console.log(`No ${ROOT_REPORT} found at root level`);

  // Check if the target report exists
  if (fs.existsSync(TARGET_REPORT)) {
    console.log(`${TARGET_REPORT} already exists`);
  } else {
    console.log(`No report file found at ${TARGET_REPORT}`);
    console.log('Checking if jest-to-sonar.js needs to be run...');

    // Try to run jest-to-sonar.js if available
    if (fs.existsSync(path.join('scripts', 'jest-to-sonar.js'))) {
      console.log('Running jest-to-sonar.js to generate the report');
      require('./jest-to-sonar.js');
    } else {
      console.error('No mechanism found to generate the report');
    }
  }
}

console.log('Test report cleanup completed');
