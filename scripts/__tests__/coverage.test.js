/**
 * Tests for the coverage script
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Coverage Script', () => {
  const projectRoot = resolve(__dirname, '../..');
  const coverageScriptPath = resolve(projectRoot, 'scripts/bin/coverage.js');

  it('should correctly resolve test-report.xml paths', () => {
    // Create mock test-report.xml files in the apps directories
    const apiReportPath = resolve(projectRoot, 'apps/api/test-report.xml');
    const webReportPath = resolve(projectRoot, 'apps/web/test-report.xml');

    // Create temporary coverage directory
    const apiUnitCoverageDir = resolve(projectRoot, 'coverage/api/unit');
    const webUnitCoverageDir = resolve(projectRoot, 'coverage/web/unit');
    const webSnapshotCoverageDir = resolve(
      projectRoot,
      'coverage/web/snapshot'
    );

    try {
      // Create directories and mock report files
      mkdirSync(apiUnitCoverageDir, { recursive: true });
      mkdirSync(webUnitCoverageDir, { recursive: true });
      mkdirSync(webSnapshotCoverageDir, { recursive: true });

      // Sample report content
      const reportContent = '<testExecutions></testExecutions>';

      // Create test-report.xml files
      writeFileSync(apiReportPath, reportContent);
      writeFileSync(webReportPath, reportContent);

      // Run a command that moves reports
      execSync(`node ${coverageScriptPath} --type=unit`, { stdio: 'ignore' });

      // Check if the files were moved to the correct locations
      const apiReportMoved = existsSync(
        resolve(apiUnitCoverageDir, 'sonar-report.xml')
      );
      const webReportMoved = existsSync(
        resolve(webUnitCoverageDir, 'sonar-report.xml')
      );

      expect(apiReportMoved).toBe(true); // API report should be moved by unit test command
      expect(webReportMoved).toBe(true); // Web report should be moved by unit test command

      // Create the web report again since it was moved
      writeFileSync(webReportPath, reportContent);

      // Now run the snapshot test which should move the web report again
      execSync(`node ${coverageScriptPath} --type=snapshot`, {
        stdio: 'ignore',
      });

      // Check if the web report was moved to the snapshot directory
      const webSnapshotReportMoved = existsSync(
        resolve(webSnapshotCoverageDir, 'sonar-report.xml')
      );

      expect(webSnapshotReportMoved).toBe(true); // Web report should be moved to snapshot directory
    } finally {
      // Clean up created files
      if (existsSync(apiReportPath)) unlinkSync(apiReportPath);
      if (existsSync(webReportPath)) unlinkSync(webReportPath);

      // Clean up coverage directory
      execSync(`rm -rf ${resolve(projectRoot, 'coverage')}`, {
        stdio: 'ignore',
      });
    }
  });
});
