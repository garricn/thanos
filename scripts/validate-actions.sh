#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Validating GitHub Actions workflows...${NC}"

# Check if actionlint is installed
if ! command -v ./actionlint &>/dev/null; then
  echo -e "${YELLOW}actionlint not found in current directory. Attempting to download...${NC}"
  bash <(curl -s https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
fi

# Check if yaml-lint is installed
if ! npm list yaml-lint &>/dev/null; then
  echo -e "${YELLOW}yaml-lint not found. Installing...${NC}"
  npm install yaml-lint
fi

# Run YAML linting
echo -e "${YELLOW}Running YAML linting on workflow files...${NC}"
npx yaml-lint -c configs/lint/.yamllint .github/workflows/*.yml || {
  echo -e "${RED}YAML linting failed!${NC}"
  exit 1
}

# Run actionlint
echo -e "${YELLOW}Running actionlint on workflow files...${NC}"
./actionlint -color .github/workflows/*.yml || {
  echo -e "${RED}actionlint validation failed!${NC}"
  exit 1
}

echo -e "${GREEN}All GitHub Actions workflows are valid!${NC}"
