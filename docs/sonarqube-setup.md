# SonarQube Setup Guide

This document provides instructions for setting up and using SonarQube with this project.

## Overview

SonarQube is a platform for continuous inspection of code quality and security. It performs automatic reviews with static analysis to detect bugs, code smells, and security vulnerabilities.

## Prerequisites

- SonarQube server (self-hosted or SonarCloud)
- SonarQube authentication token

## Local Setup

1. **Install SonarQube Scanner**

   The project already has the SonarQube scanner installed as a dev dependency:

   ```bash
   # Already included in package.json
   npm install --save-dev sonarqube-scanner
   ```

2. **Configure Environment Variables**

   Create a `.env` file in the project root (do not commit this file) with your SonarQube credentials:

   ```
   SONAR_TOKEN=your-sonar-token
   SONAR_HOST_URL=https://your-sonarqube-server
   ```

   Alternatively, you can set these environment variables in your shell:

   ```bash
   export SONAR_TOKEN=your-sonar-token
   export SONAR_HOST_URL=https://your-sonarqube-server
   ```

3. **Run SonarQube Analysis**

   ```bash
   npm run sonar
   ```

## CI/CD Integration

The project is already configured to run SonarQube analysis in the CI pipeline. The analysis will run automatically after the coverage job completes.

### GitHub Secrets

To enable SonarQube analysis in CI, add the following secrets to your GitHub repository:

- `SONAR_TOKEN`: Your SonarQube authentication token
- `SONAR_HOST_URL`: The URL of your SonarQube server

## Configuration

The SonarQube configuration is defined in the `sonar-project.properties` file in the project root. Key settings include:

- `sonar.projectKey`: Unique identifier for the project in SonarQube
- `sonar.sources`: Directories containing source code to analyze
- `sonar.exclusions`: Patterns for files to exclude from analysis
- `sonar.tests`: Directories containing test files
- `sonar.javascript.lcov.reportPaths`: Path to code coverage reports

## Quality Gates

SonarQube uses Quality Gates to determine if your code meets quality standards. The default Quality Gate includes:

- No new bugs
- No new vulnerabilities
- No new code smells with severity higher than minor
- Code coverage on new code >= 80%
- Duplicated lines < 3%

You can customize Quality Gates in the SonarQube server settings.

## Troubleshooting

- **Analysis fails with authentication error**: Check that your `SONAR_TOKEN` and `SONAR_HOST_URL` are correct.
- **Coverage reports not found**: Ensure that the coverage job is generating reports in the expected location.
- **Analysis succeeds but no results in SonarQube**: Verify that the project key in `sonar-project.properties` matches the project key in SonarQube.

## Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarQube JavaScript Documentation](https://docs.sonarqube.org/latest/analysis/languages/javascript/)
- [SonarQube Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
