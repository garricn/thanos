#!/usr/bin/env node

/**
 * This script fixes jest-sonar-reporter file output locations
 * It moves test-report.xml files from workspace directories to the desired locations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Paths configuration
const apiReportSource = path.join(projectRoot, 'apps/api/test-report.xml');
const webReportSource = path.join(projectRoot, 'apps/web/test-report.xml');
const apiReportDest = path.join(
  projectRoot,
  'coverage/api/unit/sonar-report.xml'
);
const webUnitReportDest = path.join(
  projectRoot,
  'coverage/web/unit/sonar-report.xml'
);
const webSnapshotReportDest = path.join(
  projectRoot,
  'coverage/web/snapshot/sonar-report.xml'
);

// Get the report type from command line arguments
const reportType = process.argv[2];

function moveFile(source, destination) {
  if (fs.existsSync(source)) {
    // Make sure the destination directory exists
    const destDir = path.dirname(destination);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    try {
      fs.copyFileSync(source, destination);
      fs.unlinkSync(source);
      console.log(`✅ Moved file: ${source} -> ${destination}`);
      return true;
    } catch (err) {
      console.error(`❌ Error moving file: ${err.message}`);
      return false;
    }
  } else {
    console.log(`⚠️ Source file not found: ${source}`);
    return false;
  }
}

// Handle file moves based on report type
if (reportType === 'api') {
  moveFile(apiReportSource, apiReportDest);
} else if (reportType === 'web-unit') {
  moveFile(webReportSource, webUnitReportDest);
} else if (reportType === 'web-snapshot') {
  moveFile(webReportSource, webSnapshotReportDest);
} else if (reportType === 'all') {
  const apiMoved = moveFile(apiReportSource, apiReportDest);
  const webMoved = moveFile(webReportSource, webUnitReportDest);

  if (!apiMoved && !webMoved) {
    console.error(
      '❌ No report files were moved. Make sure tests were run with jest-sonar-reporter.'
    );
    process.exit(1);
  }
} else {
  console.error(
    '❌ Invalid report type. Use: api, web-unit, web-snapshot, or all'
  );
  process.exit(1);
}
