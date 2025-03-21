#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Exit on any error
set -e

# Get Node.js version from .nvmrc
NVMRC_VERSION=$(cat .nvmrc)

echo -e "${YELLOW}Checking Node.js version consistency...${NC}"

# Check package.json engines field
echo -e "\n${YELLOW}Checking package.json...${NC}"
if grep -q "\"node\":" "package.json"; then
  PACKAGE_NODE_VERSION=$(grep "\"node\":" "package.json" | head -1 | sed -E 's/.*"node": "([^"]+)".*/\1/')
  if [ "$PACKAGE_NODE_VERSION" != "$NVMRC_VERSION" ]; then
    echo -e "${RED}❌ Error: Node.js version in package.json ($PACKAGE_NODE_VERSION) does not match .nvmrc ($NVMRC_VERSION)${NC}"
    echo -e "${YELLOW}    Please update package.json to use version from .nvmrc${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ package.json Node.js version matches .nvmrc${NC}"
else
  echo -e "${RED}❌ Error: No Node.js version specified in package.json engines field${NC}"
  exit 1
fi

# Check GitHub Actions workflow files
echo -e "\n${YELLOW}Checking GitHub Actions workflows...${NC}"
for workflow in .github/workflows/*.yml; do
  if [ -f "$workflow" ]; then
    if grep -q "node-version:" "$workflow"; then
      WORKFLOW_NODE_VERSION=$(grep "node-version:" "$workflow" | head -1 | sed -E 's/.*node-version: ([0-9]+).*/\1/')
      if [ "$WORKFLOW_NODE_VERSION" != "$NVMRC_VERSION" ]; then
        echo -e "${RED}❌ Error: Node.js version in $workflow ($WORKFLOW_NODE_VERSION) does not match .nvmrc ($NVMRC_VERSION)${NC}"
        echo -e "${YELLOW}    Please update $workflow to use version from .nvmrc${NC}"
        exit 1
      fi
      echo -e "${GREEN}✅ $workflow Node.js version matches .nvmrc${NC}"
    else
      echo -e "${YELLOW}ℹ️ $workflow does not specify a Node.js version directly. Skipping check.${NC}"
    fi
  fi
done

echo -e "\n${GREEN}✅ All Node.js version references are in sync with .nvmrc${NC}"
