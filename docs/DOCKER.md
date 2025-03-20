# Docker Setup and Usage

## Table of Contents

- [Overview](#overview)
- [Docker Components](#docker-components)
- [Installation](#installation)
- [Development Environment](#development-environment)
- [CI Environment](#ci-environment)
- [Comparison with Local CI](#comparison-with-local-ci)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Docker provides containerization for the Thanos project, ensuring consistent development and CI environments across different machines. This document explains how Docker is used in the project, when to use it, and how it compares with other local CI options.

### Why Docker?

- **Consistency**: Ensures the same environment for all developers and CI
- **Isolation**: Prevents "works on my machine" problems
- **Dependency Management**: Simplifies managing complex dependencies
- **Portability**: Run the application anywhere Docker is installed
- **Scalability**: Easily scale services for production

## Docker Components

The project includes several Docker-related files:

| File                                   | Description                                     |
| -------------------------------------- | ----------------------------------------------- |
| `configs/docker/Dockerfile.dev`        | Configuration for local development environment |
| `configs/docker/Dockerfile.ci`         | Configuration for CI environment                |
| `configs/docker/docker-compose.yml`    | Multi-container setup for local development     |
| `configs/docker/docker-compose-ci.yml` | Multi-container setup for CI                    |
| `scripts/docker-ci.sh`                 | Script to run CI checks in Docker               |
| `scripts/docker/run-ci.sh`             | Script executed inside the Docker CI container  |

## Installation

### Prerequisites

- Docker Desktop (for Mac/Windows) or Docker Engine (for Linux)
- Docker Compose (included in Docker Desktop)

### Installation Steps

1. **Install Docker Desktop**:

   - Visit [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   - Download and install Docker Desktop for your operating system
   - Follow the installation instructions

2. **Verify Installation**:

   ```bash
   docker --version
   docker-compose --version
   ```

3. **Start Docker Desktop**:
   - Docker Desktop must be running for Docker commands to work
   - On macOS, Docker Desktop appears in the menu bar

## Development Environment

The development environment uses `configs/docker/docker-compose.yml` and `configs/docker/Dockerfile.dev` to create a consistent development setup.

### Starting the Development Environment

```bash
docker-compose up
```

This command:

- Builds the Docker images if they don't exist
- Creates and starts containers for the API and web application
- Maps ports 3000 (API) and 4200 (web) to your local machine
- Mounts your local code into the containers for live reloading

### Stopping the Development Environment

```bash
docker-compose down
```

### Development Features

- **Volume Mounting**: Changes to your local code are immediately reflected in the containers
- **Node Modules Volume**: Prevents node_modules from being overwritten by your local directory
- **Environment Variables**: Development-specific environment variables are set in `docker-compose.yml`

## CI Environment

The CI environment uses `configs/docker/docker-compose-ci.yml` and `configs/docker/Dockerfile.ci` to run validation checks in an isolated environment.

### Running CI Checks

```bash
npm run docker:ci
```

This command:

- Builds the Docker image for CI if it doesn't exist
- Creates and starts a container for running CI checks
- Runs the validation script inside the container
- Reports the results and exits

### CI Features

- **Isolated Environment**: Ensures tests run in a clean, consistent environment
- **Node.js Version Validation**: Verifies that all Node.js version references match `.nvmrc`
- **GitHub Actions Validation**: Validates GitHub Actions workflow files
- **Linting and Type Checking**: Runs linting and type checking in the container

## Comparison with Local CI

The project offers multiple ways to run CI checks locally:

| Feature            | Docker CI                     | Local CI Script                 | GitHub Actions        |
| ------------------ | ----------------------------- | ------------------------------- | --------------------- |
| **Command**        | `npm run docker:ci`           | `npm run local-ci`              | N/A                   |
| **Environment**    | Isolated container            | Local machine                   | GitHub runners        |
| **Setup Required** | Docker installation           | Node.js only                    | None locally          |
| **Consistency**    | High (matches CI)             | Medium (depends on local setup) | Highest (actual CI)   |
| **Speed**          | Medium (container build time) | Fast (runs directly)            | Slow (queuing, setup) |
| **Resource Usage** | Medium-High                   | Low                             | None locally          |

### When to Use Docker CI

Use Docker CI when:

- You want to ensure your changes work in a clean environment
- You're making changes to Docker-related files
- You're experiencing "works on my machine" issues
- You want to validate against a specific Node.js version without changing your local setup

### When to Use Local CI Script

Use the local CI script when:

- You want quick feedback during development
- You're making small changes and want to validate quickly
- You already have the correct Node.js version installed
- Docker is not available or practical on your machine

## Common Commands

### Development Commands

```bash
# Start development environment
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Stop development environment
docker-compose down

# Rebuild images
docker-compose build

# View logs
docker-compose logs

# View logs for a specific service
docker-compose logs api
```

### CI Commands

```bash
# Run CI checks in Docker
npm run docker:ci

# Run CI checks and keep container for inspection
docker-compose -f docker-compose-ci.yml up --build

# Run bash in the CI container
docker-compose -f docker-compose-ci.yml run --rm ci bash
```

### Utility Commands

```bash
# List running containers
docker ps

# View container logs
docker logs <container_id>

# Remove unused images
docker image prune

# Remove all unused Docker objects
docker system prune
```

## Troubleshooting

### Common Issues

#### Docker Desktop Not Running

**Symptom**: `Cannot connect to the Docker daemon`

**Solution**: Start Docker Desktop application

#### Port Conflicts

**Symptom**: `Error starting userland proxy: port is already allocated`

**Solution**: Stop the service using the port or modify port mapping in `docker-compose.yml`

#### Container Exiting Immediately

**Symptom**: Container starts and stops immediately

**Solution**: Check logs with `docker-compose logs` or add a command that keeps the container running

#### Node Modules Issues

**Symptom**: Missing dependencies or wrong versions

**Solution**: Delete the node_modules volume and rebuild:

```bash
docker-compose down -v
docker-compose up --build
```

## Best Practices

1. **Keep Images Small**: Use slim variants and multi-stage builds
2. **Use .dockerignore**: Exclude unnecessary files from the build context
3. **Layer Caching**: Order Dockerfile commands to maximize cache usage
4. **Environment Variables**: Use environment variables for configuration
5. **Volume Mounting**: Use volumes for persistent data and development
6. **Security**: Run containers with least privilege
7. **Resource Limits**: Set memory and CPU limits for containers
8. **Regular Updates**: Keep base images updated for security patches
9. **Documentation**: Document Docker-specific commands and configurations
10. **Validation**: Regularly validate Docker setup with `npm run docker:ci`

This approach balances speed and thoroughness, ensuring you catch issues early while still having confidence in your final changes.
