#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Validating GitHub Actions workflows...${NC}"

# Check if yamllint is installed
if ! command -v yamllint &>/dev/null; then
  echo -e "${YELLOW}yamllint not found. Installing...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install yamllint
  else
    sudo apt-get update && sudo apt-get install -y yamllint
  fi
fi

# Run YAML linting
echo -e "${YELLOW}Running YAML linting on workflow files...${NC}"
yamllint -c configs/lint/.yamllint .github/workflows/*.yml || {
  echo -e "${RED}❌ GitHub Actions workflow validation failed${NC}"
  exit 1
}

echo -e "${GREEN}✅ GitHub Actions workflow validation passed${NC}"
