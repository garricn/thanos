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

# Check if Docker Compose is installed
if ! command -v docker-compose &>/dev/null; then
  echo -e "${YELLOW}Docker Compose not found as standalone command. Trying with 'docker compose'...${NC}"
  if ! docker compose version &>/dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose to use this script.${NC}"
    echo -e "${YELLOW}Visit https://docs.docker.com/compose/install/ for installation instructions.${NC}"
    exit 1
  else
    DOCKER_COMPOSE="docker compose"
  fi
else
  DOCKER_COMPOSE="docker-compose"
fi

# Run the Docker container using docker-compose
echo -e "${YELLOW}Running CI checks in Docker container...${NC}"
echo -e "${YELLOW}This will validate that all Node.js version references are in sync with .nvmrc${NC}"
$DOCKER_COMPOSE -f docker-compose-ci.yml up --build --abort-on-container-exit

# Check the exit code of the Docker container
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}Docker CI completed successfully!${NC}"
else
  echo -e "${RED}Docker CI failed with exit code $EXIT_CODE${NC}"
  exit $EXIT_CODE
fi
