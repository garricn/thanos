# Local CI Workflows

This document explains the local CI workflows available in this project, which help ensure consistency between your local development environment and the GitHub Actions CI environment.

## Available Workflows

### 1. Local CI Script (`npm run local-ci`)

Runs the same checks as the GitHub Actions CI workflow locally:

- Linting
- Type checking
- Unit tests
- Snapshot tests
- Optional E2E tests
- Security checks
- GitHub Actions workflow validation

**When to use:** Before pushing changes to ensure they will pass in the CI environment.

```bash
npm run local-ci
```

### 2. GitHub Actions Workflow Validation (`npm run validate:actions`)

Validates your GitHub Actions workflow files using `actionlint` and `yaml-lint`:

- Checks for syntax errors
- Validates action versions
- Ensures proper workflow structure

**When to use:** After making changes to any GitHub Actions workflow file (`.github/workflows/*.yml`).

```bash
npm run validate:actions
```

### 3. Docker-based CI Environment (`npm run docker:ci`)

Runs the local CI checks in a Docker container that closely mimics the GitHub Actions environment:

- Uses the same Node.js version as GitHub Actions
- Installs the same dependencies
- Provides a clean, isolated environment

**When to use:** When you need to debug CI issues or want to ensure your changes work in an environment very similar to GitHub Actions.

```bash
# Requires Docker to be installed
npm run docker:ci
```

### 4. Act for GitHub Actions (`npm run act`)

Runs GitHub Actions workflows locally using the [nektos/act](https://github.com/nektos/act) tool:

- Executes the actual GitHub workflow files locally
- Runs in Docker containers similar to GitHub Actions runners
- Uses your local GitHub tokens for authentication
- Supports artifacts, secrets, and most GitHub Actions features

**When to use:** When you need to test actual GitHub Actions workflows without pushing to GitHub.

```bash
# Run with default parameters (push event, main workflow)
npm run act

# Run a specific event
npm run act -- pull_request

# Run a specific workflow file
npm run act -- push -W .github/workflows/specific-workflow.yml
```

For more details, see the [Running GitHub Actions Locally with Act](./ACT.md) documentation.

## Setting Up Docker for Local CI

To use the Docker-based CI workflow:

1. Install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Verify installation with `docker --version`
3. Run `npm run docker:ci` to test the Docker-based CI environment

## Pre-push Git Hook

A pre-push Git hook is configured to automatically run the local CI checks before pushing to the repository. This helps prevent pushing changes that would fail in the CI environment.

## Benefits of Local CI Workflows

- **Catch issues early:** Find and fix problems before they reach the CI environment
- **Save time:** Avoid waiting for CI failures by catching them locally
- **Ensure consistency:** Make sure your local environment behaves similarly to the CI environment
- **Validate GitHub Actions:** Prevent workflow syntax errors and outdated action versions

## Troubleshooting

If you encounter issues with the local CI workflows:

1. Make sure you're using the correct Node.js version (specified in `.nvmrc`)
2. Ensure all dependencies are installed with `npm ci`
3. For Docker-based CI, make sure Docker is running
4. Check the logs for specific error messages
