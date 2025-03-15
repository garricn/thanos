# CI Approaches Comparison

This document compares different CI approaches available in the Thanos project.

## Overview

The Thanos project offers three different ways to run CI checks:

1. Local CI Script (`npm run ci`)
2. Docker CI (`npm run docker:ci`)
3. GitHub Actions CI (automatic on push/PR)

Each approach has its advantages and disadvantages, and this document will help you choose the right one for your needs.

## Comparison Table

| Feature                   | Local CI              | Docker CI           | GitHub Actions          |
| ------------------------- | --------------------- | ------------------- | ----------------------- |
| Command                   | `npm run ci`          | `npm run docker:ci` | Automatic on push/PR    |
| Environment               | Local machine         | Docker container    | GitHub servers          |
| Setup Requirements        | Node.js, dependencies | Docker              | None (for usage)        |
| Consistency               | Varies by machine     | Consistent          | Consistent              |
| Speed                     | Fast                  | Medium              | Slow                    |
| Resource Usage            | Medium                | High                | None (remote)           |
| Isolation                 | None                  | High                | Complete                |
| Dependency on Local Setup | High                  | Medium              | None                    |
| Accuracy to Actual CI     | Low                   | Medium              | High (is the actual CI) |
| Debugging Ease            | High                  | Medium              | Low                     |

## Local CI Script

The Local CI script runs all checks directly on your local machine.

### Local CI Command

```bash
npm run ci
```

### Local CI Advantages

- Fast execution
- Simple setup (just Node.js and npm)
- Easy to debug issues
- Low resource usage

### Local CI Disadvantages

- Results may vary based on your local environment
- Requires all dependencies to be installed locally
- May not catch environment-specific issues

### Local CI Use Cases

- During active development for quick feedback
- When making small changes
- When you have a stable development environment

## Docker CI

The Docker CI runs all checks in a Docker container, providing an environment similar to the actual CI.

### Docker CI Command

```bash
npm run docker:ci
```

### Docker CI Advantages

- Consistent environment regardless of local setup
- Isolates dependencies from your system
- More closely matches the actual CI environment
- Can catch environment-specific issues

### Docker CI Disadvantages

- Slower than local CI
- Requires Docker to be installed and running
- Uses more system resources
- Can be more difficult to debug issues

### Docker CI Use Cases

- Before pushing important changes
- When you suspect environment-specific issues
- When you want to ensure your changes will pass in the actual CI
- When working on changes to the build process

## GitHub Actions CI

The GitHub Actions CI runs on GitHub's servers when you push changes or create a pull request.

### GitHub Actions Command

Automatic on push or pull request, but can be manually triggered from GitHub UI.

### GitHub Actions Advantages

- Completely isolated environment
- Exact same environment as the production CI
- No local resources used
- Runs all checks comprehensively

### GitHub Actions Disadvantages

- Slowest option
- Requires pushing changes to GitHub
- More difficult to debug issues
- Limited number of concurrent runs

### GitHub Actions Use Cases

- For final verification before merging
- When you need to run the full test suite
- When you've made significant changes
- When you need to verify changes across multiple environments

## Decision Guide

Choose the appropriate CI approach based on your current needs:

1. **Local CI** - Use during active development for quick feedback
2. **Docker CI** - Use before committing/pushing to ensure environment consistency
3. **GitHub Actions** - Use for final verification before merging

## Integration in Development Workflow

For optimal development practices, consider this tiered approach:

1. Run **Local CI** frequently during development
2. Run **Docker CI** before committing significant changes
3. Let **GitHub Actions CI** run automatically on push/PR for final verification

This approach balances speed and thoroughness, ensuring you catch issues early while still having confidence in your final changes.
