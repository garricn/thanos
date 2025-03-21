# Local CI Guide

This document explains how to use the local CI workflow in the project.

## Overview

Local CI allows you to run the same checks that GitHub Actions runs, but on your local machine. This provides quick feedback during development without waiting for cloud CI.

## Available CI Methods

1. **Basic Local CI** (`npm run local-ci`)
2. **GitHub Actions Local** (`npm run act`)

## Local CI Details

### 1. Basic Local CI (`npm run local-ci`)

Runs essential checks on your local machine:

```bash
npm run local-ci
```

This runs:

- Linting
- Type checking
- Unit tests
- Build verification

### 2. GitHub Actions Local (`npm run act`)

Runs the actual GitHub Actions workflows locally:

```bash
npm run act
```

This requires:

- [act](https://github.com/nektos/act) to be installed
- About 20GB of free disk space for container images

## Setting Up Local CI

1. Install Node.js (version specified in `.nvmrc`)
2. Run `npm install` to install dependencies
3. Install act if you want to run GitHub Actions locally:

   ```bash
   brew install act  # macOS
   ```

## Best Practices

1. Run local CI before pushing changes
2. Use `act` for full workflow testing
3. Keep dependencies up to date
4. Monitor test coverage

## Troubleshooting

### Common Issues

1. **Node.js Version Mismatch**

   - Use `nvm use` to switch to the correct version
   - Check `.nvmrc` for the required version

2. **Dependencies Issues**

   - Run `npm install` to update dependencies
   - Clear node_modules with `npm run clean:deep`

3. **Test Failures**
   - Check test output for specific failures
   - Run individual test suites if needed

## Configuration

Local CI configuration is spread across several files:

1. `package.json` - NPM scripts
2. `.github/workflows/` - GitHub Actions workflows
3. `configs/` - Various tool configurations

## Contributing

When modifying the CI process:

1. Update both local and GitHub Actions configurations
2. Test changes with both `local-ci` and `act`
3. Document any new requirements or steps
4. Update troubleshooting guides if needed
