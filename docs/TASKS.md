# Project Tasks

This document tracks all tasks, improvements, and fixes for the Thanos project.

<!--
ASSISTANT REMINDER:
This is a monorepo project with React frontend (apps/web) and Express backend (apps/api).

IMPORTANT: DO NOT spend time exploring the project structure when asked about next tasks.
Instead, use this reminder as your complete context and reference.

When asked "what should we work on next", prioritize tasks in this order:
1. Uncompleted high priority issues and security hotspots
2. Testing improvements (current coverage is 0.0%)
3. Documentation tasks
4. Feature implementation tasks
5. DevOps and performance improvements

Project structure:
- apps/web: React frontend
- apps/api: Express backend

The project uses:
- React, TypeScript, Vite, Tailwind CSS, Shadcn UI (frontend)
- Node.js, Express, SQLite (backend)
- Jest (unit tests), Cypress (E2E tests)
- SonarCloud for code quality analysis

Current status:
- All security hotspots have been addressed
- Test coverage is at 0.0% and needs immediate attention
- Documentation is incomplete
- Core features are partially implemented
-->

## Table of Contents

- [SonarCloud Tasks](#sonarcloud-tasks)
  - [High Priority Issues](#high-priority-issues)
  - [Medium Priority Issues](#medium-priority-issues)
  - [Security Hotspots](#security-hotspots)
  - [Technical Debt](#technical-debt)
  - [Coverage Improvements](#coverage-improvements)
- [CI/CD Improvements](#cicd-improvements)
- [Code Quality](#code-quality)
- [ESLint Refactoring Tasks](#eslint-refactoring-tasks)
- [Testing Improvements](#testing-improvements)
- [Security](#security)
- [Documentation](#documentation)
- [Performance](#performance)
- [DevOps](#devops)
- [Features](#features)
- [Dependencies](#dependencies)
- [Project Structure Improvements](#project-structure-improvements)
  - [Configuration Organization](#configuration-organization)

## SonarCloud Tasks

### High Priority Issues

### Medium Priority Issues

### Security Hotspots

- [x] Review security hotspot: This framework implicitly discloses version information by default. Make sure it is safe here. in apps/api/src/main.ts (line 9)
- [x] Fix Cross-site Scripting (XSS) vulnerability in vite@5.1.4 by upgrading to vite@5.4.12
- [x] Fix Origin Validation Error in vite@5.1.4 by upgrading to vite@5.4.12
- [x] Fix Information Exposure vulnerability in vite@5.1.4 by upgrading to vite@5.4.12
- [x] Fix Improper Access Control in vite@5.1.4 by upgrading to vite@5.4.12
- [x] Fix Missing Release of Resource vulnerability in inflight@1.0.6 (from sqlite3 dependency)

### Technical Debt

- [ ] Review and update all outdated dependencies
- [ ] Implement automated dependency updates with version constraints
- [ ] Set up regular security audit schedule

### Coverage Improvements

- [ ] Increase overall test coverage (currently 0.0%)
- [ ] Focus on adding tests for core components
- [ ] Ensure all new code has at least 80% test coverage

## CI/CD Improvements

- [x] Ensure snapshot tests run in CI
- [x] Reorder jobs in ci.yml
- [x] Fix indentation in CI workflow file
- [x] Add log upload job to CI workflow for better debugging
- [x] Fix "husky not found" error in CI by setting HUSKY=0 environment variable
- [x] Add a CI-specific script in package.json that explicitly disables husky
- [x] Set up a global environment variable in the CI workflow file
- [x] Integrate SonarCloud analysis into CI workflow
- [x] Make CI fail when SonarCloud quality gates fail
- [x] Add SonarCloud analysis results as a comment on PRs
- [ ] Create a .huskyrc.json file to configure husky behavior in different environments
- [ ] Implement caching for node_modules to speed up CI builds
- [x] Add status badges to README.md for CI status
- [x] Fix E2E tests in CI - web server fails to start within timeout period
- [x] Configure Snyk authentication for Security Check job in CI
- [ ] Monitor E2E test reliability over time and track flaky tests
- [x] Make Security Check job required by adding it to the Validate job dependencies
- [x] Remove continue-on-error from Security Check job once Snyk authentication is set up
- [ ] Add E2E tests to Validate job dependencies once they're consistently passing
- [x] Set up proper Snyk authentication in GitHub repository secrets
- [ ] Create a dashboard or report for tracking E2E test stability
- [ ] Standardize port usage across all environments (align ciBaseUrl with local port)
- [ ] Add pre-flight checks in CI to verify services are running correctly
- [ ] Implement automatic retries for E2E tests in CI
- [ ] Add port conflict detection to CI pipeline
- [ ] Enhance CI logging to capture server startup information and port usage
- [x] Add quality gates in CI to enforce minimum code quality standards
- [ ] Optimize SonarCloud analysis job to reduce CI execution time
- [ ] Implement caching for SonarCloud scanner to speed up analysis
- [ ] Add SonarCloud quality gate status to GitHub commit status checks
- [ ] Configure SonarCloud to analyze only changed files in PRs for faster feedback
- [ ] Set up scheduled full SonarCloud analysis for comprehensive weekly reports
- [ ] Implement SonarCloud custom rules specific to project requirements
- [x] Update outdated GitHub Actions to latest versions
- [x] Implement GitHub Actions workflow validation in CI
- [x] Create local workflow for validating GitHub Actions configurations
- [ ] Fix CI Workflow failures by addressing failing tests or configuration issues

## Code Quality

- [x] Install and configure YAML linter extension
- [ ] Set up automated code formatting on pre-commit
- [ ] Implement stricter ESLint rules
- [ ] Add more comprehensive unit tests
- [ ] Improve test coverage to >90%
- [x] Set up SonarQube for code quality analysis
- [x] Configure SonarQube quality gates and quality profiles
- [x] Set up SonarCloud integration with GitHub Actions
- [x] Add SonarCloud badges to README.md
- [ ] Configure SonarCloud notifications for quality alerts
- [x] Set up SonarCloud PR decoration for automated code reviews
- [ ] Create custom quality profiles in SonarCloud for project-specific rules
- [ ] Implement code complexity metrics tracking
- [x] Set up code duplication detection
- [ ] Add maintainability index tracking
- [x] Implement technical debt quantification and tracking
- [ ] Set up automated code reviews in PRs
- [ ] Create SonarCloud quality gate dashboard for team visibility
- [ ] Document SonarCloud quality gate rules and thresholds
- [ ] Set up SonarCloud webhook integration with Slack/Teams for alerts
- [x] Configure SonarCloud branch analysis for feature branches
- [ ] Implement SonarCloud issue assignment workflow
- [ ] Create custom SonarCloud quality reports for stakeholders
- [ ] Set up periodic SonarCloud quality trend analysis
- [x] Add npm scripts for running SonarCloud analysis locally
- [x] Fix ESLint errors in the codebase
- [x] Fix TypeScript errors in the codebase
- [x] Implement consistent code formatting with Prettier
- [x] Set up pre-commit hooks for code quality checks
- [x] Create ESLint configuration for consistent code style
- [x] Fix linting issues in log.model.spec.ts (replace any and Function types)
- [x] Create dedicated path resolution test to isolate SQLite3 binding issues
- [x] Update Jest configuration to exclude problematic test files
- [ ] Fix SQLite3 binding issues in main.path.spec.ts and app.spec.ts
- [ ] Improve test coverage for error handling paths in app.ts and main.ts
- [ ] Fix TypeScript warning about processing JS files
- [ ] Refactor duplicated path resolution logic into a shared utility
- [ ] Set up codecov for test analytics to detect flaky tests and report on failures
- [ ] Configure codecov to track test suite problems and provide insights
- [ ] Set up JS Bundle Analysis in codecov to track and limit bundle sizes in JS merges
- [ ] Configure SonarQube Cloud to properly analyze code coverage
- [ ] Set up additional steps for SonarQube Cloud coverage analysis
- [ ] Create a standardized approach for API error handling
- [ ] Implement consistent logging across the API
- [ ] Refactor the API to use a layered architecture (controllers, services, repositories)
- [ ] Improve API response format standardization
- [ ] Implement API documentation with OpenAPI/Swagger
- [ ] Completely remove NX dependencies from E2E testing setup
  - [x] Update e2e.sh script to use npm commands instead of nx
  - [x] Update Cypress configuration in apps/web/e2e to remove nx imports
  - [x] Create standalone package.json files for E2E test directories
  - [x] Update CI workflow to use npm run test:e2e instead of nx commands
  - [x] Update COMMANDS.md to reflect new E2E testing commands
  - [x] Remove NX dependencies from project.json files in E2E directories
  - [x] Remove Nx references from README.md and other documentation
  - [x] Remove Nx references from configuration files (jest.config.ts, postcss.config.js)
  - [x] Update test reporting scripts to remove Nx references

## ESLint Refactoring Tasks

- [ ] Migrate CommonJS modules to ES Modules for consistent module patterns
  - [ ] Update all package.json files with "type": "module"
  - [ ] Convert require() statements to import statements in all files
  - [ ] Convert module.exports to export default or named exports
  - [ ] Update tsconfig.json files to use "module": "ESNext" or "NodeNext" and "moduleResolution": "NodeNext"
  - [ ] Fix module detection in main.ts (replace require.main with import.meta.url check)
  - [ ] Update Jest configs to properly support ESM (add "extensionsToTreatAsEsm" and moduleNameMapper)
  - [ ] Add NODE_OPTIONS="--experimental-vm-modules" to test scripts
  - [ ] Update E2E test files to use ESM syntax for consistent pattern
  - [ ] Fix path resolution in ESM imports (add .js extensions where needed)
  - [ ] Update support files in test directories (global-setup.ts, test-setup.ts, etc.)
- [ ] Create a Logger Service to replace direct console usage with a dedicated logger service for different environments
- [ ] Restructure tests to avoid requiring mocked modules
- [ ] Refactor `build.js` to use ES modules and eliminate `eslint-disable` comments
- [ ] Refactor `test-utils.ts` to use a more testable structure that doesn't require `eslint-disable` comments
- [ ] Implement proper logging infrastructure to replace console statements in server code
- [ ] Review and refactor test files to follow best practices and eliminate the need for `eslint-disable` comments

## Testing Improvements

- [x] Fix baseUrl in Cypress config to match actual web server port
- [ ] Create a pre-test script that verifies the web server is running on expected port
- [ ] Use environment variables for port configuration instead of hardcoding
- [ ] Add health check endpoints to services for E2E test verification
- [ ] Configure Cypress to run tests in parallel
- [ ] Add visual regression testing
- [ ] Tag tests as "smoke", "critical", or "extended"
- [ ] Create a helper script that starts all required services and runs tests
- [ ] Add VS Code tasks for common testing operations
- [ ] Create a troubleshooting guide for common E2E test issues
- [x] Set up Jest for unit testing
- [x] Create test fixtures and mocks
- [x] Implement end-to-end tests
- [x] Set up test coverage reporting
- [x] Create test utilities for common testing tasks
- [x] Implement test parallelization
- [x] Create dedicated path resolution test to isolate module loading issues
- [ ] Fix SQLite3 binding issues in failing tests
- [ ] Improve test coverage to reach 85% statement coverage
- [ ] Add tests for error handling paths
- [ ] Implement integration tests for database operations
- [ ] Implement Dependency Injection for API server to improve testability
- [ ] Add unit tests for main.ts after implementing DI
- [ ] Create a standardized approach for handling API test data
- [ ] Implement consistent module boundary exceptions for test files
- [ ] Fix husky hooks configuration to properly install Git hooks
- [ ] Resolve pre-push hook failures with proper Husky configuration
- [ ] Create mock implementations for external services to improve test isolation

## Security

- [x] Implement dependency vulnerability scanning in CI
- [ ] Set up automated security scanning for container images
- [x] Create a security policy document
- [x] Implement automated secret scanning
- [x] Add SAST (Static Application Security Testing) to CI pipeline
- [x] Set up Software Composition Analysis (SCA) for third-party dependencies
- [x] Implement license compliance checking for dependencies
- [ ] Configure security-focused ESLint rules
- [x] Set up Dependabot alerts and security PRs
- [ ] Implement security headers in the application
- [ ] Add pre-commit hooks for secret detection
- [x] Configure GitHub secret scanning
- [x] Set up and configure Snyk integration
- [x] Add Snyk token to GitHub repository secrets
- [ ] Set up automated vulnerability fix PRs with Snyk
- [ ] Configure vulnerability severity thresholds for CI/CD pipeline
- [ ] Implement security scanning for Docker images
- [ ] Create security issue templates for vulnerability reports
- [ ] Implement Docker security best practices:
  - [ ] Use minimal base images (e.g., alpine or slim variants)
  - [ ] Implement least privilege principle with non-root users
  - [ ] Scan Docker images for vulnerabilities with Trivy or Clair
  - [ ] Set up Docker content trust for image signing
  - [ ] Implement Docker secrets management
  - [ ] Configure read-only file systems where possible
  - [ ] Set resource limits on containers
  - [ ] Implement network segmentation for Docker services
  - [ ] Add security linting for Dockerfiles
  - [ ] Create Docker security compliance documentation

## Documentation

- [x] Improve README.md with more detailed setup instructions
- [ ] Add architecture documentation
- [ ] Create API documentation
- [x] Add contributing guidelines
- [ ] Document deployment process
- [x] Document SonarCloud setup and configuration
- [ ] Create a code quality standards document referencing SonarCloud rules
- [ ] Document port configurations for all services in all environments
- [ ] Create architecture diagram showing all services and their port configurations
- [ ] Document complete environment setup process
- [ ] Create test strategy document
- [x] Document security practices and policies
- [ ] Create SonarCloud onboarding guide for new team members
- [ ] Document SonarCloud quality metrics interpretation guide
- [x] Create troubleshooting guide for common SonarCloud issues
- [ ] Document process for addressing SonarCloud-reported issues
- [ ] Create SonarCloud integration maintenance guide
- [x] Break up README.md into smaller, focused markdown files:
  - [x] Create GETTING_STARTED.md with installation and basic usage
  - [x] Create COMMANDS.md with detailed command reference
  - [x] Create TROUBLESHOOTING.md for common issues and solutions
  - [x] Create PROJECT_STRUCTURE.md for directory structure details
  - [x] Create CODE_COVERAGE.md for coverage information
  - [x] Create CONTRIBUTING.md for contribution guidelines
  - [x] Update README.md to be more concise with links to detailed docs
- [x] Standardize documentation file naming and formatting:
  - [x] Convert all doc file names to UPPERCASE_WITH_UNDERSCORES format
  - [x] Create documentation style guide for consistent formatting
  - [x] Standardize heading levels, code blocks, tables, and link styles
- [x] Consolidate redundant documentation:
  - [x] Merge sonarqube-setup.md into SONARCLOUD.md
  - [x] Move all security information from README.md to SECURITY.md
- [x] Improve TASKS.md organization:
  - [x] Organize tasks by status (completed, in progress, planned)
  - [ ] Add dates to completed tasks
  - [x] Consider moving to GitHub Issues or Projects
- [x] Update inaccurate content:
  - [x] Fix copyright year in LICENSE section
  - [ ] Replace placeholder email addresses with real ones
  - [x] Add documentation index to README.md
- [x] Add table of contents to each documentation file over a certain size
- [ ] Implement documentation versioning strategy:
  - [ ] Define versioning approach (Git tags, dedicated tool, etc.)
  - [ ] Create process for updating documentation with code changes
  - [ ] Add version indicators to documentation files
- [ ] Add more visual elements to documentation:
  - [ ] Create architecture diagrams
  - [ ] Add UI component screenshots
  - [ ] Create process flowcharts
- [ ] Set up automated documentation checks:
  - [ ] Add markdown linting to CI pipeline
  - [ ] Implement link validation
  - [ ] Add spelling and grammar checks
- [ ] Migrate TASKS.md to GitHub Issues and Projects:
  - [ ] Create project board with appropriate columns
  - [ ] Convert tasks to issues with appropriate labels
  - [ ] Set up automation for issue tracking
  - [ ] Create documentation for issue management process
- [x] Document local CI workflows and their benefits:
  - [x] Create LOCAL_CI.md with detailed explanation of local CI workflows
  - [x] Update COMMANDS.md with local CI commands
  - [x] Add LOCAL_CI.md to documentation index in README.md
- [ ] Create Docker documentation:
  - [ ] Create DOCKER.md with detailed Docker setup instructions
  - [ ] Document Docker Compose usage for development
  - [ ] Document Docker CI usage and benefits
  - [ ] Add Docker troubleshooting guide
  - [ ] Create Docker best practices document
  - [ ] Document Docker image architecture
  - [ ] Add Docker commands to COMMANDS.md
  - [ ] Create Docker environment variables reference
  - [ ] Document Docker volume management

## Performance

- [ ] Optimize build process
- [ ] Implement code splitting for frontend
- [ ] Add performance monitoring
- [ ] Optimize database queries
- [ ] Implement caching strategy
- [ ] Optimize Docker performance:
  - [ ] Implement multi-stage builds to reduce image size
  - [ ] Use Docker BuildKit for faster builds
  - [ ] Optimize Dockerfile layer caching
  - [ ] Implement proper .dockerignore file
  - [ ] Configure container resource limits
  - [ ] Benchmark and optimize Docker Compose startup time
  - [ ] Implement Docker volume caching for node_modules
  - [ ] Use Docker layer compression
  - [ ] Optimize Docker networking
  - [ ] Implement Docker image pruning strategy

## DevOps

- [ ] Set up automated deployment pipeline
- [ ] Implement infrastructure as code
- [ ] Set up monitoring and alerting
- [ ] Implement blue/green deployment strategy
- [ ] Create disaster recovery plan
- [x] Use Docker Compose for local development to ensure consistent environments
- [ ] Fix NVM compatibility warning with npm config prefix
- [x] Implement single source of truth for Node.js version:
  - [x] Create/update .nvmrc file as the canonical source of Node.js version
  - [x] Create a script to validate that all references to Node.js version are in sync
  - [x] Update clean-deep.sh to read Node.js version from .nvmrc
  - [x] Update switch-node.sh to read Node.js version from .nvmrc
  - [x] Add pre-commit hook to verify version consistency
  - [x] Consider node version in ci.yml
  - [x] Ensure GitHub Actions workflow reads Node.js version from .nvmrc
- [x] Implement validate-node-version.sh execution at key points:
  - [x] Add to Git pre-commit hook via Husky
  - [x] Add as an early step in CI workflow
  - [x] Create Git hook specifically for .nvmrc file changes
  - [x] Include in project setup/onboarding process
  - [x] Add to pre-release checklist
  - [x] Document the validation process in README.md
  - [x] Integrate validate:node-version into the main validate script
  - [x] Add engines.node field to package.json
- [x] Integrate validate:actions into the main validate script
- [x] Set up Docker for local CI:
  - [x] Install Docker Desktop from <https://www.docker.com/products/docker-desktop/>
  - [x] Verify installation with `docker --version`
  - [x] Run `npm run docker:ci` to test the Docker-based CI environment
  - [x] Update validate-node-version.sh to check Dockerfile.ci
  - [x] Create docker-compose.yml for local development
  - [x] Create docker-compose-ci.yml for CI
  - [x] Update docker-ci.sh script to use docker-compose
  - [x] Create Dockerfile.dev for local development
- [ ] Enhance Docker setup:
  - [ ] Create Docker documentation in docs/DOCKER.md
  - [ ] Add Docker health checks to services
  - [ ] Optimize Docker image sizes
  - [ ] Implement multi-stage builds for production images
  - [ ] Set up Docker volume for persistent data
  - [ ] Configure Docker networking for local service discovery
  - [ ] Add Docker Compose profiles for different development scenarios
  - [ ] Implement Docker-based E2E testing environment
- [ ] Implement Docker in GitHub Actions:
  - [ ] Use Docker containers in GitHub Actions workflows
  - [ ] Set up Docker layer caching in GitHub Actions
  - [ ] Create GitHub Actions workflow for building and publishing Docker images
  - [ ] Implement Docker-based matrix testing in CI

## Local CI Workflows

- [ ] Run local CI checks before pushing changes: `npm run local-ci`
- [x] Validate GitHub Actions workflows: `npm run validate:actions`
- [x] Run CI in Docker container (requires Docker): `npm run docker:ci`
- [x] Document local CI workflows and their benefits
- [x] Create pre-push Git hook to run local CI checks automatically
- [x] Update GitHub Actions workflows to use latest action versions
- [ ] Implement automated action version checking
- [ ] Enhance Docker-based CI:
  - [ ] Expand Docker CI to run all validation checks
  - [ ] Add unit tests to Docker CI
  - [ ] Add E2E tests to Docker CI
  - [ ] Create Docker CI performance metrics
  - [ ] Implement parallel test execution in Docker CI
  - [ ] Add Docker CI results reporting

## Features

- [ ] Implement user authentication
- [ ] Add user profile management
- [ ] Create admin dashboard
- [ ] Implement notification system
- [ ] Add search functionality
- [ ] Implement database integration for the API
- [ ] Create database models and schemas
- [ ] Set up database migrations system
- [ ] Implement proper database connection pooling
- [ ] Add data validation for API requests
- [ ] Create API endpoints for CRUD operations
- [ ] Implement proper error handling for database operations
- [ ] Add authentication and authorization to the API
- [ ] Set up environment-specific database configurations
- [ ] Implement database seeding for development and testing
- [ ] Create frontend components to interact with the API
- [ ] Implement client-side data validation
- [ ] Add loading states and error handling in the UI

## Dependencies

- [ ] Regularly update dependencies
- [ ] Create a dependency update strategy
- [ ] Document version constraints and compatibility requirements
- [ ] Set up automated dependency updates with Dependabot

## Project Structure Improvements

### Configuration Organization

- [ ] Create a structured `configs` directory with subdirectories for different config types:
  - [ ] `configs/lint` - ESLint, Prettier, and other linting configurations
  - [ ] `configs/test` - Jest and testing-related configurations
  - [ ] `configs/build` - TypeScript, Vite, and build-related configurations
  - [ ] `configs/docker` - Docker and container-related configurations
  - [ ] `configs/ci` - CI/CD related configurations
- [ ] Move non-essential configuration files to appropriate subdirectories:
  - [x] Move linting configs (eslint.config.mjs, eslint.base.config.mjs, .prettierrc, etc.) to `configs/lint`
  - [ ] Move testing configs (jest.config.ts, jest.preset.js, jestSonar.config.js) to `configs/test`
  - [ ] Move build configs (vite.config.ts, tsconfig.json, etc.) to `configs/build`
  - [x] Move Docker files (docker-compose.yml, Dockerfile.dev) to `configs/docker`
  - [x] Move CI configs (docker-compose-ci.yml, Dockerfile.ci) to `configs/docker`
- [x] Improve binary tool management:
  - [x] Remove actionlint binary from repository
  - [x] Add actionlint to .gitignore
  - [x] Update local-ci.sh to handle actionlint installation automatically
- [x] Move Jest configuration files:
  - [x] Move jest.setup.js to scripts/ directory
  - [x] Update all references in Jest configuration files
- [x] Update .gitignore for IDE-specific directories:
  - [x] Ensure .vscode/ is ignored (already was)
  - [x] Add .cursor/ to .gitignore
- [x] Improve .gitignore organization and comprehensiveness:
  - [x] Organize entries into clear, logical sections
  - [x] Ensure all generated directories are properly ignored
  - [x] Add common environment and temporary files
  - [x] Include patterns for all build artifacts
- [ ] Standardize Jest configuration paths:
  - [ ] Choose a consistent approach for all path references (<rootDir> or path.resolve)
  - [ ] Update all Jest configuration files to use the standardized approach
  - [ ] Document the preferred approach in a comment for future reference
- [ ] Update and relocate generate.js:
  - [ ] Move generate.js to scripts/ directory
  - [ ] Update generate.js to fix outdated functionality
  - [ ] Add package.json script to run it from the new location
  - [ ] Update documentation to reference the new location
- [ ] Clean up redundant YAML linting configurations:
  - [ ] Switch to yamllint (native tool) for better performance and features:
    - [ ] Remove .yaml-lint.json and yaml-lint npm package
    - [ ] Keep .yamllint configuration
    - [ ] Update package.json scripts to use yamllint
    - [ ] Add yamllint installation instructions to README
    - [ ] Update CI workflow to use yamllint
  - [ ] Ensure all YAML files are properly linted with the new configuration
- [ ] Implement dedicated JSON formatter:
  - [ ] Research and select appropriate JSON formatting tool (e.g., json-stringify-pretty-compact)
  - [ ] Add JSON formatting script to package.json
  - [ ] Update .prettierignore to exclude JSON files
  - [ ] Test formatting on various JSON files (package.json, tsconfig.json, etc.)
  - [ ] Document JSON formatting approach in project docs
- [ ] Consolidate configuration into package.json where appropriate:
  - [ ] Replace .nvmrc with "engines" field in package.json for Node.js version requirements (note: .nvmrc is still needed for nvm users)
  - [ ] Research if .npmrc settings can be moved to npm scripts or keep as separate file
  - [ ] Research if .snyk settings can be managed through package.json or keep as separate file
- [ ] Update file references in project files:
  - [ ] Update package.json scripts to reference the new config file locations
  - [ ] Update import statements in configuration files to use the new paths
  - [ ] Create symbolic links for tools that require configs to be in the root directory
- [ ] Keep essential configs at the root:
  - [ ] Package.json and package-lock.json
  - [ ] .gitignore, .npmrc, .nvmrc, and other essential dotfiles
  - [ ] LICENSE and README.md
- [ ] Document the configuration structure in the project documentation
- [ ] Create an npm script to validate configuration references after reorganization
- [ ] All generated dirs and files should live in generated/
- [ ] Relative paths should be relative to project root

## Other

- [ ] Logging
- [ ] Analytics
- [ ] Experimentation and feature flagging
- [ ] Dependency Injection
- [ ] Shut servers down gracefully to avoid errors when running test:e2e
