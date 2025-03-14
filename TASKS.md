# Project Tasks

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

CI/CD Improvements

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

## Documentation

- [ ] Improve README.md with more detailed setup instructions
- [ ] Add architecture documentation
- [ ] Create API documentation
- [ ] Add contributing guidelines
- [ ] Document deployment process
- [ ] Document SonarCloud setup and configuration
- [ ] Create a code quality standards document referencing SonarCloud rules
- [ ] Document port configurations for all services in all environments
- [ ] Create architecture diagram showing all services and their port configurations
- [ ] Document complete environment setup process
- [ ] Create test strategy document
- [x] Document security practices and policies
- [ ] Create SonarCloud onboarding guide for new team members
- [ ] Document SonarCloud quality metrics interpretation guide
- [ ] Create troubleshooting guide for common SonarCloud issues
- [ ] Document process for addressing SonarCloud-reported issues
- [ ] Create SonarCloud integration maintenance guide

## Performance

- [ ] Optimize build process
- [ ] Implement code splitting for frontend
- [ ] Add performance monitoring
- [ ] Optimize database queries
- [ ] Implement caching strategy

## DevOps

- [ ] Set up automated deployment pipeline
- [ ] Implement infrastructure as code
- [ ] Set up monitoring and alerting
- [ ] Implement blue/green deployment strategy
- [ ] Create disaster recovery plan
- [ ] Use Docker Compose for local development to ensure consistent environments
- [ ] Fix NVM compatibility warning with npm config prefix

## Features

- [ ] Implement user authentication
- [ ] Add user profile management
- [ ] Create admin dashboard
- [ ] Implement notification system
- [ ] Add search functionality

## Dependencies

- [ ] Regularly update dependencies
- [ ] Create a dependency update strategy
- [ ] Document version constraints and compatibility requirements
- [ ] Set up automated dependency updates with Dependabot
