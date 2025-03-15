# Docker Troubleshooting Guide

This document provides solutions for common Docker-related issues you might encounter while working with the Thanos project.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Connection Issues](#connection-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Performance Issues](#performance-issues)
- [Volume and Data Issues](#volume-and-data-issues)
- [CI-Specific Issues](#ci-specific-issues)

## Installation Issues

### Docker Desktop Won't Install

**Problem**: Docker Desktop installation fails.

**Solutions**:

1. Ensure your system meets the requirements (Windows 10 Pro/Enterprise or macOS 10.14+)
2. Check for conflicting virtualization software (VirtualBox, VMware)
3. For Windows, ensure Hyper-V and Windows Subsystem for Linux are enabled
4. For Mac, check System Preferences > Security & Privacy for blocked installations

### Docker Desktop Crashes on Startup

**Problem**: Docker Desktop crashes immediately after starting.

**Solutions**:

1. Reset Docker Desktop to factory defaults (Settings > Troubleshoot > Reset to factory defaults)
2. Reinstall Docker Desktop
3. Check system logs for specific errors
4. Ensure you have sufficient disk space

## Connection Issues

### Cannot Connect to Docker Daemon

**Problem**: Commands fail with `Cannot connect to the Docker daemon`.

**Solutions**:

1. Ensure Docker Desktop is running
2. Check Docker Desktop status in the system tray/menu bar
3. Restart Docker Desktop
4. For Linux, ensure your user is in the `docker` group

### Network Connectivity Issues

**Problem**: Containers cannot connect to the internet or each other.

**Solutions**:

1. Check your firewall settings
2. Verify Docker network settings (Docker Desktop > Settings > Resources > Network)
3. Try resetting the Docker network:

   ```bash
   docker network prune
   ```

4. Check if your VPN is interfering with Docker networking

## Build Issues

### Docker Build Fails

**Problem**: `docker-compose build` or `docker build` fails.

**Solutions**:

1. Check the error message for specific issues
2. Ensure you have sufficient disk space
3. Verify your Dockerfile syntax
4. Try building with verbose output:

   ```bash
   docker-compose build --no-cache --progress=plain
   ```

### Node.js Package Installation Fails

**Problem**: npm install fails during Docker build.

**Solutions**:

1. Check if you're using the correct Node.js version in your Dockerfile
2. Ensure package.json and package-lock.json are in sync
3. Try clearing npm cache in the Dockerfile:

   ```dockerfile
   RUN npm cache clean --force
   ```

4. Increase memory available to Docker (Docker Desktop > Settings > Resources)

## Runtime Issues

### Container Exits Immediately

**Problem**: Container starts and then exits immediately.

**Solutions**:

1. Check container logs:

   ```bash
   docker-compose logs
   ```

2. Ensure your container has a running process (CMD or ENTRYPOINT)
3. Check for errors in your startup script
4. Try running with an interactive shell to debug:

   ```bash
   docker-compose run --rm service_name bash
   ```

### Port Conflicts

**Problem**: `Error starting userland proxy: port is already allocated`.

**Solutions**:

1. Check if another process is using the same port:

   ```bash
   # For macOS/Linux
   lsof -i :3000

   # For Windows
   netstat -ano | findstr :3000
   ```

2. Stop the conflicting process or change the port mapping in docker-compose.yml
3. Restart Docker Desktop

### Services Can't Communicate

**Problem**: Services in docker-compose can't reach each other.

**Solutions**:

1. Use service names as hostnames (e.g., `http://api:3000` from the web service)
2. Check if services are on the same network
3. Verify service names in docker-compose.yml
4. Check if services are actually running:

   ```bash
   docker-compose ps
   ```

## Performance Issues

### Slow Container Performance

**Problem**: Docker containers run slowly.

**Solutions**:

1. Increase resources allocated to Docker (Docker Desktop > Settings > Resources)
2. Optimize your Dockerfile (reduce layers, use multi-stage builds)
3. Use volume mounting for development instead of copying files
4. Consider using Alpine-based images for smaller footprint

### High CPU/Memory Usage

**Problem**: Docker uses excessive CPU or memory.

**Solutions**:

1. Set resource limits in docker-compose.yml:

   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

2. Check for resource leaks in your application
3. Restart Docker Desktop
4. Prune unused Docker resources:

   ```bash
   docker system prune
   ```

## Volume and Data Issues

### Volume Mount Not Working

**Problem**: Changes to local files are not reflected in the container.

**Solutions**:

1. Check volume paths in docker-compose.yml
2. Ensure Docker has permission to access the directories
3. For Windows, ensure file sharing is enabled for the directory
4. Try using absolute paths instead of relative paths

### Node Modules Issues

**Problem**: Missing dependencies or wrong versions in the container.

**Solutions**:

1. Delete the node_modules volume and rebuild:

   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. Ensure package.json and package-lock.json are in sync
3. Check if you're using the correct Node.js version

### Data Persistence Issues

**Problem**: Data is lost when containers are restarted.

**Solutions**:

1. Use named volumes for data that should persist:

   ```yaml
   services:
     app:
       volumes:
         - app_data:/app/data

   volumes:
     app_data:
   ```

2. Check if you're accidentally removing volumes with `docker-compose down -v`
3. Verify volume mounts in docker-compose.yml

## CI-Specific Issues

### Docker CI Script Fails

**Problem**: `npm run docker:ci` fails.

**Solutions**:

1. Check the error message for specific issues
2. Ensure Docker Desktop is running
3. Verify that docker-compose is installed
4. Check if the script has execute permissions:

   ```bash
   chmod +x scripts/docker-ci.sh
   ```

### Actionlint Errors

**Problem**: Actionlint validation fails in Docker CI.

**Solutions**:

1. Check if actionlint is installed correctly in the Dockerfile
2. Verify that your GitHub Actions workflow files are valid
3. Run actionlint locally to debug:

   ```bash
   npm run validate:actions
   ```

### Node.js Version Validation Fails

**Problem**: Node.js version validation fails in Docker CI.

**Solutions**:

1. Ensure all Node.js version references match the version in .nvmrc
2. Check Dockerfile.ci, docker-compose.yml, and docker-compose-ci.yml for correct Node.js version
3. Run the validation script locally:

   ```bash
   npm run validate:node-version
   ```

### Docker Build Context Too Large

**Problem**: Docker build is slow or fails due to large context size.

**Solutions**:

1. Create or update .dockerignore to exclude unnecessary files
2. Remove large files or directories from your project
3. Use a more specific build context in docker-compose.yml
