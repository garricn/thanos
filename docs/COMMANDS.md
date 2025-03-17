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

| Command                                                | Description                                              |
| ------------------------------------------------------ | -------------------------------------------------------- |
| `nx test web`                                          | Run frontend unit tests                                  |
| `nx test api`                                          | Run backend unit tests                                   |
| `nx test web --test-file=Button.snapshot.test.tsx`     | Run specific snapshot tests                              |
| `nx e2e web-e2e`                                       | Run UI tests                                             |
| `nx e2e web-e2e --headed`                              | Run UI tests in watch mode                               |
| `nx run web-e2e:run-headed`                            | Run UI tests with Cypress UI visible                     |
| `npm run test:all`                                     | Run all unit and e2e tests for the project               |
| `npm run test:unit`                                    | Run only unit tests (no e2e tests)                       |
| `npm run test:snapshot`                                | Run only snapshot tests                                  |
| `npm run coverage`                                     | Generate coverage reports for unit and snapshot tests    |
| `npm run coverage:report`                              | Generate detailed coverage reports with multiple formats |
| `npm run coverage:open`                                | Generate coverage reports and open them in your browser  |
| `npm run coverage:fresh`                               | Generate fresh coverage reports by clearing all caches   |
| `npm run coverage:fresh:open`                          | Generate fresh coverage reports and open in browser      |
| `npm run test:component:fresh --component=MyComp`      | Run tests for a specific component with fresh caches     |
| `npm run test:component:fresh:open --component=MyComp` | Run component tests with fresh caches and open report    |

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

## Local CI Commands

Commands for running CI checks locally to ensure consistency with the GitHub Actions environment.

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `npm run local-ci`         | Run the same checks as the GitHub Actions CI workflow |
| `npm run validate:actions` | Validate GitHub Actions workflow files                |
| `npm run docker:ci`        | Run CI checks in a Docker container (requires Docker) |

For more details on these commands, see the [Local CI Workflows](./LOCAL_CI.md) documentation.

## Docker Commands

Commands for working with Docker in the project. For detailed information, see the [Docker documentation](./DOCKER.md).

### Development Environment

| Command                        | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `docker-compose up`            | Start the development environment                  |
| `docker-compose up -d`         | Start the development environment in detached mode |
| `docker-compose down`          | Stop the development environment                   |
| `docker-compose build`         | Rebuild the development Docker images              |
| `docker-compose logs`          | View logs from all services                        |
| `docker-compose logs api`      | View logs from the API service                     |
| `docker-compose logs web`      | View logs from the web service                     |
| `docker-compose restart`       | Restart all services                               |
| `docker-compose restart api`   | Restart only the API service                       |
| `docker-compose exec api bash` | Open a bash shell in the running API container     |
| `docker-compose exec web bash` | Open a bash shell in the running web container     |

### CI Environment

| Command                                               | Description                       |
| ----------------------------------------------------- | --------------------------------- |
| `npm run docker:ci`                                   | Run CI checks in Docker           |
| `docker-compose -f docker-compose-ci.yml up --build`  | Build and run the CI environment  |
| `docker-compose -f docker-compose-ci.yml run ci bash` | Run bash in the CI container      |
| `docker-compose -f docker-compose-ci.yml down`        | Stop and remove the CI containers |

### Docker Utilities

| Command                               | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| `docker ps`                           | List running containers                          |
| `docker ps -a`                        | List all containers (including stopped)          |
| `docker images`                       | List all Docker images                           |
| `docker logs <container_id>`          | View logs for a specific container               |
| `docker exec -it <container_id> bash` | Open a bash shell in a running container         |
| `docker system prune`                 | Remove unused data (containers, images, volumes) |
| `docker volume ls`                    | List all volumes                                 |
| `docker volume prune`                 | Remove all unused volumes                        |
| `docker-compose down -v`              | Stop containers and remove volumes               |
