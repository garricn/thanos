# Available Commands

This document lists all the available commands you can use in the Thanos project.

## Common Commands

These commands are used for day-to-day development tasks.

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `npm run start`           | Run both API and web servers concurrently     |
| `npm run start:no-daemon` | Run without the NX daemon (for daemon issues) |
| `nx serve web`            | Run the website locally                       |
| `nx serve api`            | Run the backend API server                    |
| `npm run clean`           | Remove all generated files and caches         |

## Testing Commands

Commands for running tests and generating coverage reports.

| Command                                            | Description                                |
| -------------------------------------------------- | ------------------------------------------ |
| `nx test web`                                      | Run frontend unit tests                    |
| `nx test api`                                      | Run backend unit tests                     |
| `nx test web --test-file=Button.snapshot.test.tsx` | Run specific snapshot tests                |
| `nx e2e web-e2e`                                   | Run UI tests                               |
| `nx e2e web-e2e --headed`                          | Run UI tests in watch mode                 |
| `nx run web-e2e:run-headed`                        | Run UI tests with Cypress UI visible       |
| `npm run test:all`                                 | Run all unit and e2e tests for the project |
| `npm run test:unit`                                | Run only unit tests (no e2e tests)         |
| `npm run coverage`                                 | Generate code coverage reports             |
| `npm run coverage:report`                          | Generate detailed HTML coverage reports    |

## Code Quality Commands

Commands for maintaining code quality.

| Command                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `nx lint web`           | Run linting for web project                                |
| `npm run lint`          | Run linting for all projects                               |
| `npm run lint:md`       | Run markdown linting                                       |
| `npm run lint:md:fix`   | Run markdown linting and fix issues automatically          |
| `npm run format`        | Run formatting for all files                               |
| `npm run format:md`     | Run formatting for markdown files only                     |
| `npm run type-check`    | Run TypeScript type checking                               |
| `npm run validate`      | Run all critical checks (lint, test, coverage, type-check) |
| `npm run validate:full` | Run all checks including E2E tests and security            |

## SonarCloud Commands

Commands for interacting with SonarCloud for code quality analysis.

| Command                                | Description                                        |
| -------------------------------------- | -------------------------------------------------- |
| `npm run sonar`                        | Run SonarCloud analysis                            |
| `npm run sonar:local`                  | Run coverage tests and then SonarCloud analysis    |
| `npm run sonar:branch`                 | Run SonarCloud analysis on the current git branch  |
| `npm run sonar:report`                 | Generate a basic SonarCloud metrics report         |
| `npm run sonar:detailed-report`        | Generate a detailed SonarCloud analysis report     |
| `npm run sonar:tasks`                  | Generate actionable tasks from SonarCloud analysis |
| `npm run sonar:update-tasks:formatted` | Update TASKS.md with SonarCloud findings           |

## Security Commands

Commands for security scanning and vulnerability management.

| Command                     | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `npm run security:check`    | Run security vulnerability scanning              |
| `npm run security:fix`      | Fix security issues (interactive)                |
| `npm run update:deps`       | Update dependencies and fix vulnerabilities      |
| `npm run update:deps:force` | Force update dependencies (for breaking changes) |
