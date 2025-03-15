#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running local CI checks...${NC}"

# Ensure we're using the correct Node version from .nvmrc
if command -v nvm &>/dev/null; then
  echo -e "${YELLOW}Using Node version from .nvmrc...${NC}"
  nvm use
else
  echo -e "${YELLOW}nvm not found. Make sure you're using the correct Node version.${NC}"
  echo -e "Current Node version: $(node -v)"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  HUSKY=0 npm ci
fi

# Lint
echo -e "${YELLOW}Running linters...${NC}"
npm run lint || {
  echo -e "${RED}Linting failed!${NC}"
  exit 1
}

# Type check
echo -e "${YELLOW}Running type check...${NC}"
npm run type-check || {
  echo -e "${RED}Type check failed!${NC}"
  exit 1
}

# Unit tests
echo -e "${YELLOW}Running unit tests...${NC}"
npm run test:unit || {
  echo -e "${RED}Unit tests failed!${NC}"
  exit 1
}

# Snapshot tests
echo -e "${YELLOW}Running snapshot tests...${NC}"
npm run test:snapshot || {
  echo -e "${RED}Snapshot tests failed!${NC}"
  exit 1
}

# E2E tests (optional - can be time consuming)
read -p "Run E2E tests? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Building API and Web for E2E tests...${NC}"
  npm run build -- --projects=api,web

  echo -e "${YELLOW}Starting servers in background...${NC}"
  npm run start:api &
  API_PID=$!
  echo "API server started with PID: $API_PID"
  sleep 10

  npm run start:web &
  WEB_PID=$!
  echo "Web server started with PID: $WEB_PID"
  sleep 10

  echo -e "${YELLOW}Running E2E tests...${NC}"
  npx nx e2e web-e2e || {
    echo -e "${RED}E2E tests failed!${NC}"
    kill $API_PID $WEB_PID
    exit 1
  }

  # Kill background processes
  kill $API_PID $WEB_PID
fi

# Security check
echo -e "${YELLOW}Running security checks...${NC}"
npm audit || echo -e "${YELLOW}npm audit found issues, but continuing...${NC}"

# Check for GitHub Actions workflow validation
if command -v actionlint &>/dev/null; then
  echo -e "${YELLOW}Validating GitHub Actions workflows...${NC}"
  actionlint -color .github/workflows/*.yml || echo -e "${YELLOW}GitHub Actions validation failed, but continuing...${NC}"
else
  echo -e "${YELLOW}actionlint not installed. Skipping GitHub Actions validation.${NC}"
  echo -e "${YELLOW}To install: bash <(curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)${NC}"
fi

echo -e "${GREEN}All local CI checks passed!${NC}"
