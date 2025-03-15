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
# Generate HTML coverage reports
npm run coverage:report

# Open the reports in your browser
open coverage/apps/web/index.html
open coverage/apps/api/index.html
```

These HTML reports provide a visual representation of coverage with color-coded line highlighting.

### 3. Terminal Summary

Generate a quick coverage summary in your terminal:

```bash
# Generate coverage reports with terminal summary
npm run coverage
```

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

1. Run `npm run coverage` to identify uncovered code
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
