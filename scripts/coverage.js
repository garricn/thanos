#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure required directories exist
function ensureDirectories() {
  const dirs = [
    'coverage/raw/api/unit',
    'coverage/raw/web/unit',
    'coverage/raw/web/snapshot',
    'coverage/combined',
    'coverage/reports/sonar',
    'coverage/reports/html',
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Clean coverage directories
function cleanCoverage() {
  console.log(chalk.blue('🧹 Cleaning coverage directories...'));
  execSync('rm -rf coverage', { stdio: 'inherit' });
  ensureDirectories();
}

// Run unit tests with coverage
function runUnitTests() {
  console.log(chalk.blue('🧪 Running unit tests...'));

  // API unit tests
  console.log(chalk.yellow('Running API unit tests...'));
  execSync(
    `npm run test --workspace=apps/api -- --coverage --coverageDirectory="${process.cwd()}/coverage/raw/api/unit" --coverageReporters=text-summary --coverageReporters=html --coverageReporters=lcov --testResultsProcessor=jest-sonar-reporter`,
    { stdio: 'inherit' }
  );
  execSync('node scripts/jest-sonar-fix.js api', { stdio: 'inherit' });

  // Web unit tests
  console.log(chalk.yellow('Running Web unit tests...'));
  execSync(
    `npm run test --workspace=apps/web -- --coverage --coverageDirectory="${process.cwd()}/coverage/raw/web/unit" --coverageReporters=text-summary --coverageReporters=html --coverageReporters=lcov --testResultsProcessor=jest-sonar-reporter`,
    { stdio: 'inherit' }
  );
  execSync('node scripts/jest-sonar-fix.js web-unit', { stdio: 'inherit' });
}

// Run snapshot tests with coverage
function runSnapshotTests() {
  console.log(chalk.blue('📸 Running snapshot tests...'));
  execSync(
    `npm run test --workspace=apps/web -- --testPathPattern=snapshot --coverage --coverageDirectory="${process.cwd()}/coverage/raw/web/snapshot" --coverageReporters=text-summary --coverageReporters=html --coverageReporters=lcov --testResultsProcessor=jest-sonar-reporter`,
    { stdio: 'inherit' }
  );
  execSync('node scripts/jest-sonar-fix.js web-snapshot', { stdio: 'inherit' });
}

// Combine coverage reports
function combineCoverage() {
  console.log(chalk.blue('🔄 Combining coverage reports...'));

  // Combine lcov files
  const lcovFiles = [
    'coverage/raw/api/unit/lcov.info',
    'coverage/raw/web/unit/lcov.info',
    'coverage/raw/web/snapshot/lcov.info',
  ];

  const combinedLcov = lcovFiles
    .filter((file) => fs.existsSync(file))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

  fs.writeFileSync('coverage/combined/lcov.info', combinedLcov);

  // Combine Sonar reports
  execSync('node scripts/combine-sonar-reports.js', { stdio: 'inherit' });
}

// Generate coverage report
function generateReport() {
  console.log(chalk.blue('📊 Generating coverage report...'));

  const reports = {
    'API Unit': 'coverage/raw/api/unit/lcov-report/index.html',
    'Web Unit': 'coverage/raw/web/unit/lcov-report/index.html',
    'Web Snapshot': 'coverage/raw/web/snapshot/lcov-report/index.html',
    Combined: 'coverage/combined/lcov-report/index.html',
  };

  console.log('\nCoverage reports generated at:');
  Object.entries(reports).forEach(([name, path]) => {
    if (fs.existsSync(path)) {
      console.log(chalk.green(`${name}: file://${process.cwd()}/${path}`));
    }
  });
}

// Open coverage reports
function openReports() {
  console.log(chalk.blue('🔍 Opening coverage reports...'));
  const reports = [
    'coverage/raw/api/unit/lcov-report/index.html',
    'coverage/raw/web/unit/lcov-report/index.html',
    'coverage/raw/web/snapshot/lcov-report/index.html',
    'coverage/combined/lcov-report/index.html',
  ].filter((file) => fs.existsSync(file));

  if (reports.length > 0) {
    execSync(`open ${reports.join(' ')}`, { stdio: 'inherit' });
  } else {
    console.log(chalk.yellow('No coverage reports found to open.'));
  }
}

// Save coverage trend
function saveCoverageTrend() {
  const trendFile = 'coverage/trend.json';
  const trend = fs.existsSync(trendFile)
    ? JSON.parse(fs.readFileSync(trendFile, 'utf8'))
    : [];

  // Extract coverage from lcov.info
  const lcovPath = 'coverage/combined/lcov.info';
  if (fs.existsSync(lcovPath)) {
    const lcov = fs.readFileSync(lcovPath, 'utf8');
    const lines = lcov.match(/LF:(\d+)/g);
    const linesCovered = lcov.match(/LH:(\d+)/g);

    if (lines && linesCovered) {
      const totalLines = lines.reduce(
        (sum, line) => sum + parseInt(line.split(':')[1]),
        0
      );
      const totalCovered = linesCovered.reduce(
        (sum, line) => sum + parseInt(line.split(':')[1]),
        0
      );
      const coverage = ((totalCovered / totalLines) * 100).toFixed(2);

      trend.push({
        date: new Date().toISOString(),
        coverage: parseFloat(coverage),
        totalLines,
        linesCovered: totalCovered,
      });

      fs.writeFileSync(trendFile, JSON.stringify(trend, null, 2));
      console.log(chalk.blue(`📈 Current coverage: ${coverage}%`));
    }
  }
}

// Main function
async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('type', {
      choices: ['unit', 'snapshot', 'all', 'none'],
      default: 'all',
      description: 'Type of tests to run',
    })
    .option('open', {
      type: 'boolean',
      default: false,
      description: 'Open coverage reports after generation',
    })
    .option('report', {
      type: 'boolean',
      default: true,
      description: 'Generate coverage report',
    })
    .option('clean', {
      type: 'boolean',
      default: true,
      description: 'Clean coverage directories before running',
    })
    .option('trend', {
      type: 'boolean',
      default: true,
      description: 'Save coverage trend data',
    })
    .help()
    .parse();

  try {
    if (argv.clean) {
      cleanCoverage();
    }

    if (argv.type === 'all' || argv.type === 'unit') {
      runUnitTests();
    }

    if (argv.type === 'all' || argv.type === 'snapshot') {
      runSnapshotTests();
    }

    combineCoverage();

    if (argv.trend) {
      saveCoverageTrend();
    }

    if (argv.report) {
      generateReport();
    }

    if (argv.open) {
      openReports();
    }

    console.log(chalk.green('\n✨ Coverage operation completed successfully!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Error running coverage:'), error);
    process.exit(1);
  }
}

main();
