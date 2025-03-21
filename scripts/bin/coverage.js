#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Ensure test directories exist
function ensureTestDirectories(type) {
  const dirs = [];

  if (type === 'all' || type === 'unit') {
    dirs.push('coverage/api/unit', 'coverage/web/unit');
  }
  if (type === 'all' || type === 'snapshot') {
    dirs.push('coverage/web/snapshot');
  }

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Ensure combine directories exist
function ensureCombineDirectories() {
  const dirs = ['coverage/combined'];

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
}

// Move Sonar report files to their correct locations
function moveSonarReports(reportType) {
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

  function moveFile(source, destination) {
    if (fs.existsSync(source)) {
      const destDir = path.dirname(destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      try {
        fs.copyFileSync(source, destination);
        fs.unlinkSync(source);
        console.log(chalk.green(`✅ Moved file: ${source} -> ${destination}`));
        return true;
      } catch (err) {
        console.error(chalk.red(`❌ Error moving file: ${err.message}`));
        return false;
      }
    } else {
      console.log(chalk.yellow(`⚠️ Source file not found: ${source}`));
      return false;
    }
  }

  switch (reportType) {
    case 'api':
      return moveFile(apiReportSource, apiReportDest);
    case 'web-unit':
      return moveFile(webReportSource, webUnitReportDest);
    case 'web-snapshot':
      return moveFile(webReportSource, webSnapshotReportDest);
    default:
      console.error(
        chalk.red('❌ Invalid report type. Use: api, web-unit, or web-snapshot')
      );
      return false;
  }
}

// Run unit tests with coverage
function runUnitTests() {
  console.log(chalk.blue('🧪 Running unit tests...'));

  // API unit tests
  console.log(chalk.yellow('Running API unit tests...'));
  execSync(
    `npm run test --workspace=apps/api -- --coverage --coverageDirectory="${process.cwd()}/coverage/api/unit" --coverageReporters=text-summary --coverageReporters=text --coverageReporters=html --coverageReporters=lcov --coverageReporters=json --coverageReporters=json-summary --testResultsProcessor=jest-sonar-reporter`,
    { stdio: 'inherit' }
  );
  // Move API report immediately after API tests
  moveSonarReports('api');

  // Web unit tests
  console.log(chalk.yellow('Running Web unit tests...'));
  execSync(
    `npm run test --workspace=apps/web -- --coverage --coverageDirectory="${process.cwd()}/coverage/web/unit" --coverageReporters=text-summary --coverageReporters=text --coverageReporters=html --coverageReporters=lcov --coverageReporters=json --coverageReporters=json-summary --testResultsProcessor=jest-sonar-reporter`,
    { stdio: 'inherit' }
  );
  // Move Web unit report immediately after web unit tests
  moveSonarReports('web-unit');
}

// Run snapshot tests with coverage
function runSnapshotTests() {
  console.log(chalk.blue('📸 Running snapshot tests...'));
  execSync(
    `npm run test --workspace=apps/web -- --testPathPattern=snapshot --coverage --coverageDirectory="${process.cwd()}/coverage/web/snapshot" --coverageReporters=text-summary --coverageReporters=text --coverageReporters=html --coverageReporters=lcov --coverageReporters=json --coverageReporters=json-summary --testResultsProcessor=jest-sonar-reporter`,
    { stdio: 'inherit' }
  );
  // Move Web snapshot report immediately after snapshot tests
  moveSonarReports('web-snapshot');
}

// Recursive directory copy function
function copyRecursiveSync(src, dest) {
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
}

// Combine coverage reports
function combineCoverage() {
  console.log(chalk.blue('🔄 Combining coverage reports...'));

  const covDirs = [
    'coverage/api/unit',
    'coverage/web/unit',
    'coverage/web/snapshot',
  ];

  // Combine LCOV files
  let combinedLcov = '';
  for (const dir of covDirs) {
    if (fs.existsSync(dir)) {
      // Handle LCOV files
      const lcovPath = path.join(dir, 'lcov.info');
      if (fs.existsSync(lcovPath)) {
        const lcovContent = fs.readFileSync(lcovPath, 'utf-8');
        combinedLcov += lcovContent + '\n';

        // Copy the lcov-report directory if it exists
        const lcovReportDir = path.join(dir, 'lcov-report');
        if (fs.existsSync(lcovReportDir)) {
          const targetDir = path.join('coverage/combined/lcov-report');
          copyRecursiveSync(lcovReportDir, targetDir);
        }
      }
    }
  }

  // Write the combined LCOV file
  fs.writeFileSync('coverage/combined/lcov.info', combinedLcov);

  // Combine Sonar XML reports
  const inputFiles = covDirs
    .map((dir) => path.join(dir, 'sonar-report.xml'))
    .filter((file) => fs.existsSync(file));

  if (inputFiles.length > 0) {
    const outputFile = path.join('coverage/combined/sonar-report.xml');

    // Read and parse the first file as the base
    const parser = new DOMParser();
    const baseContent = fs.readFileSync(inputFiles[0], 'utf8');
    const baseDoc = parser.parseFromString(baseContent, 'text/xml');
    const baseRoot = baseDoc.documentElement;

    // Process additional files
    inputFiles.slice(1).forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const doc = parser.parseFromString(content, 'text/xml');
      const root = doc.documentElement;

      // Copy all file elements from additional files
      const files = root.getElementsByTagName('file');
      for (let i = 0; i < files.length; i++) {
        const node = files.item(i);
        const imported = baseDoc.importNode(node, true);
        baseRoot.appendChild(imported);
      }
    });

    // Write the combined file
    const serializer = new XMLSerializer();
    const output = serializer.serializeToString(baseDoc);
    fs.writeFileSync(outputFile, output);
    console.log(chalk.green(`Combined Sonar report created at: ${outputFile}`));
  } else {
    console.log(chalk.yellow('No Sonar report files found to combine.'));
  }
}

// Generate coverage report
function generateReport(detailed = false) {
  console.log(chalk.blue('📊 Generating coverage report...'));

  const reports = {
    'API Unit': 'coverage/api/unit/lcov-report/index.html',
    'Web Unit': 'coverage/web/unit/lcov-report/index.html',
    'Web Snapshot': 'coverage/web/snapshot/lcov-report/index.html',
    Combined: 'coverage/combined/lcov-report/index.html',
  };

  // For terminal output, use the combined coverage
  const lcovPath = 'coverage/combined/lcov.info';
  if (fs.existsSync(lcovPath)) {
    console.log('\nCoverage Summary:');
    try {
      // Use the coverage data from the most recent test run
      const recentCoverage = detailed
        ? 'coverage/web/unit/coverage-final.json'
        : 'coverage/web/unit/coverage-summary.json';

      if (fs.existsSync(recentCoverage)) {
        const data = JSON.parse(fs.readFileSync(recentCoverage, 'utf8'));
        if (detailed) {
          // Print detailed coverage from the coverage-final.json
          Object.entries(data).forEach(([file, coverage]) => {
            console.log(`\n${chalk.cyan(file)}`);
            if (coverage.s) {
              const statements = Object.values(coverage.s);
              const total = statements.length;
              const covered = statements.filter(Boolean).length;
              console.log(
                `  Statements: ${covered}/${total} (${((covered / total) * 100).toFixed(2)}%)`
              );
            }
          });
        } else {
          // Print summary from coverage-summary.json
          const total = data.total;
          console.log(
            `Statements : ${total.statements.pct}% ( ${total.statements.covered}/${total.statements.total} )`
          );
          console.log(
            `Branches   : ${total.branches.pct}% ( ${total.branches.covered}/${total.branches.total} )`
          );
          console.log(
            `Functions  : ${total.functions.pct}% ( ${total.functions.covered}/${total.functions.total} )`
          );
          console.log(
            `Lines      : ${total.lines.pct}% ( ${total.lines.covered}/${total.lines.total} )`
          );
        }
      } else {
        console.log(
          chalk.yellow(
            'No coverage data found. Please run tests with coverage first.'
          )
        );
      }
    } catch (error) {
      console.error(chalk.red('Error generating coverage report:'), error);
    }
  }

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
    'coverage/api/unit/lcov-report/index.html',
    'coverage/web/unit/lcov-report/index.html',
    'coverage/web/snapshot/lcov-report/index.html',
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
      default: false,
      description: 'Generate coverage report',
    })
    .option('detailed', {
      type: 'boolean',
      default: false,
      description:
        'Show detailed coverage report with line-by-line information',
    })
    .option('clean', {
      type: 'boolean',
      default: false,
      description: 'Clean coverage directories before running',
    })
    .option('trend', {
      type: 'boolean',
      default: true,
      description: 'Save coverage trend data',
    })
    .option('combine', {
      type: 'boolean',
      default: true,
      description: 'Combine coverage reports after generation',
    })
    .help().argv;

  try {
    // Get the explicitly provided arguments
    const explicitArgs = process.argv.slice(2);

    // Check if this is just a clean command (explicitly set to none and no other flags)
    const isCleanCommand =
      argv.type === 'none' &&
      !argv.open &&
      !argv.report &&
      !argv.detailed &&
      !argv.clean &&
      !argv.combine;

    // Check if this is just a combine command
    const isCombineCommand =
      argv.combine &&
      !argv.open &&
      !argv.report &&
      !argv.detailed &&
      !argv.clean &&
      argv.type === 'none';

    // Clean if explicitly requested, it's the clean command, or we're running all tests
    const shouldClean = argv.clean || isCleanCommand || argv.type === 'all';

    if (shouldClean) {
      cleanCoverage();
      // Only exit early if this is the clean command
      if (isCleanCommand) {
        console.log(
          chalk.green('✨ Coverage directories cleaned successfully!')
        );
        return;
      }
    }

    // Create test directories only if we're running tests
    if (argv.type !== 'none' && !isCombineCommand) {
      ensureTestDirectories(argv.type);
    }

    // Run tests if we're not just combining
    if (!isCombineCommand) {
      if (argv.type === 'all' || argv.type === 'unit') {
        runUnitTests();
      }

      if (argv.type === 'all' || argv.type === 'snapshot') {
        runSnapshotTests();
      }
    }

    // Only create combine directories and combine if requested
    if (argv.combine) {
      ensureCombineDirectories();
      combineCoverage();

      if (argv.trend) {
        saveCoverageTrend();
      }
    }

    if (argv.report) {
      generateReport(argv.detailed);
    }

    if (argv.open) {
      openReports();
    }

    console.log(chalk.green('✨ Coverage operation completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

main();
