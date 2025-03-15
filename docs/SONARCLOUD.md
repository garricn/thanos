# SonarCloud Integration

This document explains how SonarCloud is integrated with this project for continuous code quality analysis.

## Table of Contents

- [Overview](#overview)
- [SonarCloud vs. Self-Hosted SonarQube](#sonarcloud-vs-self-hosted-sonarqube)
- [Setup](#setup)
  - [Configuration Files](#configuration-files)
  - [GitHub Secrets](#github-secrets)
- [Quality Gates](#quality-gates)
- [PR Decoration](#pr-decoration)
- [Badges](#badges)
- [Local Analysis](#local-analysis)
  - [Understanding the Reports](#understanding-the-reports)
- [Self-Hosted SonarQube Setup](#self-hosted-sonarqube-setup)
- [Viewing Results](#viewing-results)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Getting Help](#getting-help)

## Overview

SonarCloud is a cloud-based code quality and security service. It performs automatic reviews of code to detect bugs, vulnerabilities, and code smells in your codebase. Our project uses SonarCloud to:

- Analyze code quality on every push and pull request
- Enforce quality gates to maintain high code standards
- Provide detailed feedback on code issues
- Track code quality metrics over time

## SonarCloud vs. Self-Hosted SonarQube

This project primarily uses SonarCloud, but can also be configured to work with a self-hosted SonarQube instance:

| Feature        | SonarCloud                    | Self-Hosted SonarQube                        |
| -------------- | ----------------------------- | -------------------------------------------- |
| Hosting        | Cloud-based                   | Self-managed infrastructure                  |
| Setup          | Minimal setup required        | Requires server installation and maintenance |
| Cost           | Free for open source projects | Server and maintenance costs                 |
| CI Integration | Built-in GitHub integration   | Requires additional configuration            |
| Analysis       | Same analysis engine          | Same analysis engine                         |
| Custom Rules   | Limited customization         | Full customization                           |

See the [Self-Hosted SonarQube Setup](#self-hosted-sonarqube-setup) section for instructions on using a self-hosted instance.

## Setup

### Configuration Files

1. **sonar-project.properties**

   This file contains the main configuration for SonarCloud analysis:

   ```properties
   # Project identification
   sonar.projectKey=garricn_thanos
   sonar.projectName=Thanos
   sonar.projectVersion=1.0.0
   sonar.organization=garricn

   # Source code location
   sonar.sources=apps
   sonar.exclusions=**/*.test.ts,**/*.spec.ts,**/*.cy.ts,**/*.e2e.ts,**/node_modules/**,**/dist/**,**/coverage/**

   # Tests location
   sonar.tests=apps
   sonar.test.inclusions=**/*.test.ts,**/*.spec.ts,**/*.cy.ts,**/*.e2e.ts

   # Test coverage reports
   sonar.javascript.lcov.reportPaths=coverage/lcov.info

   # Encoding of the source code
   sonar.sourceEncoding=UTF-8

   # TypeScript analysis configuration
   sonar.typescript.tsconfigPath=tsconfig.base.json

   # Additional parameters
   sonar.verbose=false
   sonar.qualitygate.wait=true
   sonar.qualitygate.timeout=300
   ```

2. **GitHub Actions Workflow (.github/workflows/ci.yml)**

   The CI workflow includes a job for SonarCloud analysis:

   ```yaml
   sonarcloud:
     name: SonarCloud Analysis
     runs-on: ubuntu-latest
     needs: [coverage]
     steps:
       - uses: actions/checkout@v4
         with:
           fetch-depth: 0
       - name: Set up Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '20'
           cache: npm
       - name: Install dependencies
         run: HUSKY=0 npm ci
       - name: Download coverage reports
         uses: actions/download-artifact@v4
         with:
           name: coverage-reports
           path: coverage/
       - name: SonarCloud Scan
         if: ${{ github.event_name != 'pull_request' }}
         uses: SonarSource/sonarcloud-github-action@master
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
           SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
       - name: SonarCloud Scan with PR Decoration
         if: ${{ github.event_name == 'pull_request' }}
         uses: SonarSource/sonarcloud-github-action@master
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
           SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
         with:
           args: >
             -Dsonar.pullrequest.key=${{ github.event.pull_request.number }}
             -Dsonar.pullrequest.branch=${{ github.head_ref }}
             -Dsonar.pullrequest.base=${{ github.base_ref }}
             -Dsonar.pullrequest.github.repository=${{ github.repository }}
   ```

### GitHub Secrets

The following secrets need to be configured in your GitHub repository:

- `SONAR_TOKEN`: A token generated from SonarCloud for authentication

## Quality Gates

Quality Gates are conditions that must be met before code can be considered ready for production. Our project uses the default SonarCloud Quality Gate, which includes:

- No new bugs
- No new vulnerabilities
- No new code smells with high severity
- Code coverage on new code is at least 80%
- Duplicated lines on new code is less than 3%

If any of these conditions are not met, the CI pipeline will fail, preventing the merge of low-quality code.

## PR Decoration

SonarCloud is configured to add comments to pull requests with analysis results. This provides immediate feedback to developers about code quality issues in their changes.

## Badges

The project README includes SonarCloud badges that show the current status of code quality:

- Quality Gate Status
- Maintainability Rating
- Reliability Rating
- Security Rating

## Local Analysis

You can run SonarCloud analysis locally using the following npm scripts:

```bash
# Basic SonarCloud analysis
npm run sonar

# Run coverage tests and then SonarCloud analysis
npm run sonar:local

# Run analysis on a specific branch
npm run sonar:branch

# Generate a basic report with key metrics
npm run sonar:report

# Generate a detailed markdown report
npm run sonar:detailed-report

# Generate actionable tasks from SonarCloud analysis
npm run sonar:tasks

# Update TASKS.md with SonarCloud findings and format the file
npm run sonar:update-tasks:formatted
```

Note that you need to set the `SONAR_TOKEN` environment variable before running these commands:

```bash
export SONAR_TOKEN=your_sonar_token
```

### Understanding the Reports

The different report types provide various levels of detail:

1. **Basic Report (`sonar:report`)**: Shows key metrics like code quality, bugs, vulnerabilities, and code smells in the terminal.

2. **Detailed Report (`sonar:detailed-report`)**: Creates a comprehensive markdown file with:

   - Project overview metrics
   - Issues by severity and type
   - Detailed issue descriptions with file locations
   - Security hotspots
   - Recommended improvement tasks

3. **Tasks Report (`sonar:tasks`)**: Generates a markdown file with actionable tasks organized by priority.

4. **TASKS.md Integration (`sonar:update-tasks:formatted`)**: Updates the project's TASKS.md file with SonarCloud findings and formats it properly.

## Self-Hosted SonarQube Setup

If you prefer to use a self-hosted SonarQube instance instead of SonarCloud, follow these steps:

### Prerequisites

- SonarQube server installed and running
- SonarQube authentication token

### Configuration

1. **Configure Environment Variables**

   Create a `.env` file in the project root (do not commit this file) with your SonarQube credentials:

   ```
   SONAR_TOKEN=your-sonar-token
   SONAR_HOST_URL=https://your-sonarqube-server
   ```

   Alternatively, set these in your shell:

   ```bash
   export SONAR_TOKEN=your-sonar-token
   export SONAR_HOST_URL=https://your-sonarqube-server
   ```

2. **Update sonar-project.properties**

   For self-hosted SonarQube, remove or comment out the SonarCloud-specific properties:

   ```properties
   # Comment out for self-hosted SonarQube
   # sonar.organization=garricn

   # Add the host URL for self-hosted instances
   sonar.host.url=https://your-sonarqube-server
   ```

3. **CI/CD Integration**

   For GitHub Actions with self-hosted SonarQube, update the CI workflow:

   ```yaml
   - name: SonarQube Scan
     uses: SonarSource/sonarqube-scan-action@master
     env:
       SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
       SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
   ```

## Viewing Results

You can view the SonarCloud analysis results at:

[https://sonarcloud.io/project/overview?id=garricn_thanos](https://sonarcloud.io/project/overview?id=garricn_thanos)

For self-hosted SonarQube, access the URL of your SonarQube instance.

## Troubleshooting

### Common Issues

1. **Analysis fails with authentication error**

   - Check that the `SONAR_TOKEN` secret is correctly set in GitHub
   - Verify that the token has not expired

2. **Coverage reports not found**

   - Make sure the coverage job runs before the SonarCloud job
   - Check that the coverage reports are being generated correctly
   - Verify the path in `sonar.javascript.lcov.reportPaths`

3. **PR decoration not working**

   - Ensure the `GITHUB_TOKEN` has the necessary permissions
   - Check that the PR parameters are being passed correctly

4. **Self-hosted SonarQube connection issues**
   - Verify that the SonarQube server is accessible from the CI environment
   - Check that the `SONAR_HOST_URL` is correctly set
   - Ensure the server's SSL certificate is valid if using HTTPS

### Getting Help

If you encounter issues with SonarCloud or SonarQube integration, you can:

1. Check the [SonarCloud documentation](https://docs.sonarcloud.io/) or [SonarQube documentation](https://docs.sonarqube.org/)
2. Look at the CI logs for error messages
3. Contact the project maintainers
