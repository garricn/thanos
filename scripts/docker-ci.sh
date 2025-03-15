#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building and running CI in Docker container...${NC}"

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
  echo -e "${RED}Docker is not installed. Please install Docker to use this script.${NC}"
  echo -e "${YELLOW}Visit https://docs.docker.com/get-docker/ for installation instructions.${NC}"
  exit 1
fi

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t thanos-ci -f Dockerfile.ci .

# Run the Docker container
echo -e "${YELLOW}Running CI checks in Docker container...${NC}"
docker run --rm thanos-ci

echo -e "${GREEN}Docker CI completed!${NC}"
