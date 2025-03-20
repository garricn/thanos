# Thanos - A Modern Monorepo Scaffolding Template

[![CI](https://github.com/garricn/thanos/actions/workflows/ci.yml/badge.svg)](https://github.com/garricn/thanos/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/garricn/thanos/branch/main/graph/badge.svg?token=ADVIGYFMQH)](https://codecov.io/gh/garricn/thanos)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=alert_status)](https://sonarcloud.io/dashboard?id=garricn_thanos)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=garricn_thanos)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=garricn_thanos)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=garricn_thanos&metric=security_rating)](https://sonarcloud.io/dashboard?id=garricn_thanos)

## Description

Thanos is a scaffolding template for creating new monorepo projects with a pre-configured React frontend and Express backend. It provides a solid foundation with testing infrastructure already set up, including unit tests, snapshot tests, and E2E tests. This template helps you quickly bootstrap new projects with best practices for testing and project structure.

## Documentation Index

- [Getting Started](./docs/GETTING_STARTED.md) - Installation and setup instructions
- [Available Commands](./docs/COMMANDS.md) - List of all available commands
- [Project Structure](./docs/PROJECT_STRUCTURE.md) - Overview of the codebase organization
- [Code Coverage](./docs/CODE_COVERAGE.md) - Code coverage configuration and reporting
- [Security Practices](./docs/SECURITY.md) - Security measures and vulnerability management
- [Local CI Workflows](./docs/LOCAL_CI.md) - Running CI checks locally for consistency
- [Docker Setup](./docs/DOCKER.md) - Docker configuration and usage
- [CI Approaches Comparison](./docs/CI_COMPARISON.md) - Comparison of different CI approaches
- [Docker Troubleshooting](./docs/DOCKER_TROUBLESHOOTING.md) - Solutions for Docker-related issues
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Solutions for common issues
- [Contributing Guidelines](./docs/CONTRIBUTING.md) - How to contribute to the project
- [Claude Instructions](./docs/CLAUDE.md) - Guidelines for working with Claude AI assistant
- [CI Monitoring](./docs/CI_MONITORING.md) - CI/CD monitoring tools
- [SonarCloud Integration](./docs/SONARCLOUD.md) - SonarCloud setup and configuration
- [Project Tasks](./docs/TASKS.md) - List of current tasks and improvements

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

## Quick Start

```bash
# Clone the Thanos repository
git clone https://github.com/garricn/thanos.git

# Make the generator script executable
chmod +x /path/to/thanos/generate.js

# Create and navigate to a new empty directory
mkdir my-new-project
cd my-new-project

# Run the generator script
/path/to/thanos/generate.js

# Start your new project
npm run start
```

For detailed instructions, see the [Getting Started](./docs/GETTING_STARTED.md) guide.

## License

MIT License

Copyright (c) 2023 Garric

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

## Acknowledgements

- Tested with [Cline](https://github.com/saoudrizwan/cline) by Saoud Rizwan

---

_Note: This project was originally a learning exercise for Test-Driven Development (TDD) with an AI agent (Cline) and has been transformed into a reusable scaffolding template._

### Prerequisites

- Node.js 20 (use `nvm use` if you have nvm installed)
- npm 10 or later
- Git
- Docker and Docker Compose (for containerized development)
- yamllint (for YAML linting):
  - macOS: `brew install yamllint`
  - Linux: `sudo apt-get install yamllint`
  - Windows: `choco install yamllint`

### Installation

```bash
# Clone the Thanos repository
git clone https://github.com/garricn/thanos.git

# Make the generator script executable
chmod +x /path/to/thanos/generate.js

# Create and navigate to a new empty directory
mkdir my-new-project
cd my-new-project

# Run the generator script
/path/to/thanos/generate.js

# Start your new project
npm run start
```
