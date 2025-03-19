#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running local CI checks...${NC}"

# Ensure we're using the correct Node version from .nvmrc
EXPECTED_NODE_VERSION=$(tr -d 'v' <.nvmrc)
CURRENT_NODE_VERSION=$(node -v | tr -d 'v')

if command -v nvm &>/dev/null; then
  echo -e "${YELLOW}Using Node version from .nvmrc...${NC}"
  nvm use
else
  # Just check if Node version is close enough (major version match)
  EXPECTED_MAJOR_VERSION=$(echo "$EXPECTED_NODE_VERSION" | cut -d. -f1)
  CURRENT_MAJOR_VERSION=$(echo "$CURRENT_NODE_VERSION" | cut -d. -f1)

  echo -e "${YELLOW}nvm not found. Checking Node version compatibility...${NC}"
  echo -e "Current Node version: $(node -v), Expected major version: $EXPECTED_MAJOR_VERSION"

  if [ "$CURRENT_MAJOR_VERSION" -ne "$EXPECTED_MAJOR_VERSION" ]; then
    echo -e "${RED}Node version mismatch! Using v$CURRENT_NODE_VERSION but project requires v$EXPECTED_NODE_VERSION${NC}"
    echo -e "${YELLOW}Consider installing nvm: https://github.com/nvm-sh/nvm${NC}"
  fi
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
# Skip interactive prompt in CI environment
if [ "$CI" = "true" ]; then
  echo -e "${YELLOW}Skipping E2E tests in CI/non-interactive environment...${NC}"
else
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
    npm run test:e2e || {
      echo -e "${RED}E2E tests failed!${NC}"
      kill $API_PID $WEB_PID
      exit 1
    }

    # Kill background processes
    kill $API_PID $WEB_PID
  fi
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
