# Code Coverage

This document explains how code coverage is configured, reported, and maintained in the Thanos project.

## Overview

This project is configured with comprehensive code coverage reporting using Jest and Codecov. Code coverage measures how much of your source code is executed during tests, helping identify untested parts of your codebase.

## Viewing Coverage Reports

You can view code coverage reports in several ways:

### 1. Codecov Dashboard

- Visit [codecov.io/gh/garricn/thanos](https://codecov.io/gh/garricn/thanos)
- View overall coverage metrics, file-by-file breakdown, and historical trends
- Explore uncovered lines and branches
- Monitor coverage changes across pull requests

### 2. Local HTML Reports

Generate and view detailed HTML coverage reports locally:

```bash
# Generate HTML coverage reports and automatically open them in your browser
npm run coverage:open

# Or generate HTML coverage reports without opening them
npm run coverage:report

# Manually open the reports in your browser
open coverage/apps/web/lcov-report/index.html
open coverage/apps/api/lcov-report/index.html
```

These HTML reports provide a visual representation of coverage with color-coded line highlighting.

### 3. Terminal Summary

Generate a quick coverage summary in your terminal:

```bash
# Generate coverage reports with terminal summary
npm run coverage:report
```

## Coverage Commands

The project provides several commands for working with code coverage:

| Command                   | Description                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run coverage`        | Generates basic coverage reports in lcov format (primarily for tools like SonarQube and Codecov) |
| `npm run coverage:report` | Generates comprehensive coverage reports in multiple formats (text summary, HTML, and lcov)      |
| `npm run coverage:open`   | Generates coverage reports and automatically opens the HTML reports in your browser              |

### Differences Between Coverage Commands

- **coverage**: Minimal command that only generates lcov format reports for integration with other tools
- **coverage:report**: Comprehensive command that generates human-readable reports (text summary and HTML) in addition to lcov
- **coverage:open**: Convenience command that runs coverage:report and then opens the HTML reports in your browser

## Understanding Coverage Reports

Coverage reports provide the following metrics:

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of code branches (if/else, switch) executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

### Color Coding in HTML Reports

The HTML reports use color coding to indicate coverage levels:

- **Green**: Fully covered
- **Yellow/Orange**: Partially covered
- **Red**: Not covered

This visual feedback makes it easy to identify which parts of your code need additional testing.

## Coverage Thresholds

This project enforces minimum coverage thresholds:

```javascript
// From jest.config.ts
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

The CI pipeline will fail if coverage drops below these thresholds, ensuring that code quality is maintained.

## Improving Coverage

To improve code coverage:

1. Run `npm run coverage:open` to identify uncovered code
2. Focus on adding tests for critical business logic first
3. Use the HTML reports to find specific uncovered lines
4. Add tests for error handling paths and edge cases
5. Write tests for boundary conditions

## Coverage in CI/CD

Code coverage is an integral part of our CI/CD pipeline:

1. Tests are run automatically on each PR and push to the main branch
2. Coverage reports are generated and uploaded to Codecov
3. PRs include coverage change information
4. Failed coverage thresholds block PRs from being merged

## Best Practices

- Write tests as you develop new features (TDD approach)
- Don't just test for coverage, test for functionality
- Focus on testing business logic and edge cases
- Don't artificially inflate coverage by only testing trivial code
- Use coverage reports to identify weak spots, not as the only metric of quality
