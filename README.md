# Thanos - A Nx Monorepo Scaffolding Template

[![CI](https://github.com/garricn/thanos/actions/workflows/ci.yml/badge.svg)](https://github.com/garricn/thanos/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/garricn/thanos/branch/main/graph/badge.svg?token=ADVIGYFMQH)](https://codecov.io/gh/garricn/thanos)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=alert_status)](https://sonarcloud.io/dashboard?id=garricn_thanos)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=garricn_thanos)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=garricn_thanos)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=security_rating)](https://sonarcloud.io/dashboard?id=garricn_thanos)

## Description

Thanos is a scaffolding template for creating new Nx monorepo projects with a pre-configured React frontend and Express backend. It provides a solid foundation with testing infrastructure already set up, including unit tests, snapshot tests, and E2E tests. This template helps you quickly bootstrap new projects with best practices for testing and project structure.

## Features

- Pre-configured monorepo structure with frontend and backend
- Comprehensive test setup with Jest and Cypress
- Code quality tools including ESLint, Prettier, and TypeScript
- CI/CD workflow with GitHub Actions
- Code coverage reporting with Codecov integration
- Validation scripts for linting, testing, and type checking
- Automated quality checks for pull requests

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Node.js
- Express
- SQLite (for database storage)
- Jest (for unit and snapshot tests)
- Cypress (for UI tests)
- ESLint
- Prettier
- Nx (monorepo tool)

## Commands

| Command                                            | Description                                                    |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `npm run start`                                    | Run both API and web servers concurrently                      |
| `npm run start:no-daemon`                          | Run without the NX daemon (use if you encounter daemon issues) |
| `nx serve web`                                     | Run the website locally                                        |
| `nx serve api`                                     | Run the backend API server                                     |
| `nx test web`                                      | Run frontend unit tests                                        |
| `nx test api`                                      | Run backend unit tests                                         |
| `nx test web --test-file=Button.snapshot.test.tsx` | Run snapshot tests                                             |
| `nx e2e web-e2e`                                   | Run UI tests                                                   |
| `nx e2e web-e2e --headed`                          | Run UI tests in watch mode                                     |
| `nx run web-e2e:run-headed`                        | Run UI tests with Cypress UI visible                           |
| `nx lint web`                                      | Run linting for web project                                    |
| `npm run lint:all`                                 | Run linting for all projects                                   |
| `npm run lint:md`                                  | Run markdown linting                                           |
| `npm run lint:md:fix`                              | Run markdown linting and fix issues automatically              |
| `npm run format`                                   | Run formatting for all files                                   |
| `npm run format:md`                                | Run formatting for markdown files only                         |
| `npm run test:all`                                 | Run all unit and e2e tests for the project                     |
| `npm run test:unit`                                | Run only unit tests (no e2e tests)                             |
| `npm run coverage`                                 | Generate code coverage reports                                 |
| `npm run coverage:report`                          | Generate detailed HTML coverage reports                        |
| `npm run type-check`                               | Run TypeScript type checking                                   |
| `npm run clean`                                    | Remove all generated files and caches                          |
| `npm run validate`                                 | Run all critical checks (lint, test, coverage, type-check)     |
| `npm run validate:full`                            | Run all checks including E2E tests and security                |
| `npm run sonar`                                    | Run SonarCloud analysis                                        |
| `npm run sonar:local`                              | Run coverage tests and then SonarCloud analysis                |
| `npm run sonar:branch`                             | Run SonarCloud analysis on the current git branch              |
| `npm run sonar:report`                             | Generate a basic SonarCloud metrics report                     |
| `npm run sonar:detailed-report`                    | Generate a detailed SonarCloud analysis report                 |
| `npm run sonar:tasks`                              | Generate actionable tasks from SonarCloud analysis             |
| `npm run sonar:update-tasks:formatted`             | Update TASKS.md with SonarCloud findings                       |

## Using This Template

### Prerequisites

- Node.js 22+
- npm

### Generating a New Project

Follow these steps to create a new project using Thanos:

1. **Clone the Thanos repository** (you only need to do this once):

   ```bash
   git clone https://github.com/garricn/thanos.git
   ```

2. **Make the generator script executable** (if not already):

   ```bash
   chmod +x /path/to/thanos/generate.js
   ```

3. **Create and navigate to a new empty directory** for your project:

   ```bash
   mkdir my-new-project
   cd my-new-project
   ```

4. **Run the generator script** using the full path to the script:

   ```bash
   /full/path/to/thanos/generate.js
   ```

   For example, if you cloned thanos to your home directory:

   ```bash
   ~/thanos/generate.js
   ```

   Or using a relative path:

   ```bash
   ../thanos/generate.js
   ```

5. **Follow the prompts** to specify your project name (defaults to the current directory name)

6. The script will:

   - Copy all necessary files to your current directory
   - Update references to "thanos" with your project name
   - Initialize a new Git repository
   - Install dependencies automatically
   - Create an initial commit with a clean git state

7. **Start your new project**:

   ```bash
   npm run start
   ```

> **Note**: The `--legacy-peer-deps` flag is required due to a dependency conflict between Cypress 14.x and @nx/cypress. An `.npmrc` file with this setting is automatically created in your project.

## Using the Generated Project

1. Start both the backend API server and frontend development server with a single command:

   ```
   npm run start
   ```

   This command runs both servers concurrently and will automatically kill both servers if one fails.

   Alternatively, you can start each server separately:

   ```
   nx serve api    # Start the backend API server
   nx serve web    # Start the frontend development server (in a separate terminal)
   ```

2. Open <http://localhost:4200> in your browser to see the frontend
3. Visit <http://localhost:4200/api/health> to see the backend API response
4. Visit <http://localhost:4200/api/hello> to see the backend response with database logging
5. Click the Button to see 'Clicked' state

## Project Structure

```
thanos/
├── apps/
│   ├── web/             # Frontend React application
│   │   ├── src/         # Frontend source code
│   │   │   ├── app/     # Frontend application components
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── assets/  # Static assets
│   │   │   └── lib/     # Utility functions
│   │   └── e2e/         # Frontend end-to-end tests
│   └── api/             # Backend API application
│       ├── src/         # API source code
│       │   └── main.ts  # Express server entry point
│       └── e2e/         # API end-to-end tests
└── [config files]       # Various configuration files at root level
```

## Code Coverage

This project is configured with comprehensive code coverage reporting using Jest and Codecov.

### Viewing Coverage Reports

You can view code coverage reports in several ways:

1. **Codecov Dashboard**:

   - Visit [codecov.io/gh/garricn/thanos](https://codecov.io/gh/garricn/thanos)
   - View overall coverage metrics, file-by-file breakdown, and historical trends
   - Explore uncovered lines and branches

2. **Local HTML Reports**:

   ```bash
   # Generate HTML coverage reports
   npm run coverage:report

   # Open the reports in your browser
   open coverage/apps/web/index.html
   open coverage/apps/api/index.html
   ```

3. **Terminal Summary**:

   ```bash
   # Generate coverage reports with terminal summary
   npm run coverage
   ```

### Understanding Coverage Reports

Coverage reports provide the following metrics:

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of code branches (if/else, switch) executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

Color coding in HTML reports:

- **Green**: Fully covered
- **Yellow/Orange**: Partially covered
- **Red**: Not covered

### Coverage Thresholds

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

The CI pipeline will fail if coverage drops below these thresholds.

### Improving Coverage

To improve code coverage:

1. Run `npm run coverage` to identify uncovered code
2. Focus on adding tests for critical business logic first
3. Use the HTML reports to find specific uncovered lines
4. Add tests for error handling paths and edge cases

## Security

This project uses Snyk for security vulnerability scanning. To enable security checks in CI:

1. Sign up for a Snyk account at https://snyk.io
2. Get your Snyk API token from https://app.snyk.io/account
3. Add the token as a GitHub repository secret named `SNYK_TOKEN`

### Local Security Checks

To run security checks locally:

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate with Snyk
snyk auth

# Run security check
npm run security:check

# Fix security issues
npm run security:fix
```

### CI/CD Security Checks

Security checks are now required in CI and will:

- Run Snyk security audit if SNYK_TOKEN is configured
- Fall back to npm audit if SNYK_TOKEN is not available
- Block PRs if high or critical vulnerabilities are found
- Generate security reports as artifacts

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork this repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

MIT License

Copyright (c) 2025 Garric

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Troubleshooting

- **Issue**: If `nx e2e` fails, ensure `nx serve` is running on port 4200.
  **Solution**: Run `nx serve web` in a separate terminal before running e2e tests.

- **Issue**: Component tests failing with style-related errors.
  **Solution**: Make sure Tailwind CSS is properly configured and imported.

- **Issue**: Dependency conflicts during `npm install` with errors about Cypress versions.
  **Solution**: Use the `--legacy-peer-deps` flag: `npm install --legacy-peer-deps`. This is automatically configured in the generated project via the .npmrc file.

- **Issue**: Nx daemon errors when running commands in a generated project.
  **Solution**: Try the following options:

  **Option 1**: Run without the daemon (recommended)

  ```bash
  # Use the no-daemon script
  npm run start:no-daemon
  ```

  **Option 2**: Reset the daemon

  ```bash
  # 1. Reset the NX cache
  npx nx reset

  # 2. If that doesn't work, kill any running NX processes
  pkill -f "nx"

  # 3. Remove socket files that might be causing conflicts
  find /var/folders -name "d.sock" -delete

  # 4. Reset NX again
  npx nx reset
  ```

- **Issue**: Path references to the original Thanos project in error messages.
  **Solution**: The generator script attempts to replace all absolute paths, but if you encounter any remaining references, check the specific files mentioned in the error messages and update the paths manually.

- **Issue**: Git shows changes in .nx directory files after running commands.
  **Solution**: The .nx directory should be gitignored in generated projects. If you see these files in git status, run `git rm -r --cached .nx` to untrack them.

## Acknowledgements

- Built with [Nx](https://nx.dev/)
- Tested with [Cline](https://github.com/saoudrizwan/cline) by Saoud Rizwan

---

_Note: This project was originally a learning exercise for Test-Driven Development (TDD) with an AI agent (Cline) and has been transformed into a reusable scaffolding template._
