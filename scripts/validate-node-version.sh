#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Validating Node.js version references...${NC}"

# Read the canonical Node.js version from .nvmrc
if [ ! -f .nvmrc ]; then
  echo -e "${RED}Error: .nvmrc file not found. This file should be the source of truth for Node.js version.${NC}"
  exit 1
fi

NVMRC_VERSION=$(tr -d '\n\r' <.nvmrc)
echo -e "Canonical Node.js version from .nvmrc: ${GREEN}$NVMRC_VERSION${NC}"

# Initialize error flag
HAS_ERRORS=false

echo -e "\n${YELLOW}Checking for hardcoded Node.js version references...${NC}"

# Check if clean-deep.sh is reading from .nvmrc
if grep -q "REQUIRED_NODE_VERSION=.*tr -d.*<.*\.nvmrc" scripts/clean-deep.sh; then
  echo -e "${GREEN}✓ scripts/clean-deep.sh correctly reads Node.js version from .nvmrc${NC}"
else
  echo -e "${RED}Error: scripts/clean-deep.sh should read Node.js version from .nvmrc${NC}"
  HAS_ERRORS=true
fi

# Check if switch-node.sh is reading from .nvmrc
if grep -q "REQUIRED_VERSION=.*tr -d.*<.*\.nvmrc" scripts/switch-node.sh; then
  echo -e "${GREEN}✓ scripts/switch-node.sh correctly reads Node.js version from .nvmrc${NC}"
else
  echo -e "${RED}Error: scripts/switch-node.sh should read Node.js version from .nvmrc${NC}"
  HAS_ERRORS=true
fi

# Check if package.json postinstall is reading from .nvmrc
if grep -q "using Node.js.*cat .nvmrc" package.json; then
  echo -e "${GREEN}✓ package.json postinstall message correctly reads Node.js version from .nvmrc${NC}"
else
  echo -e "${RED}Error: package.json postinstall message should read Node.js version from .nvmrc${NC}"
  HAS_ERRORS=true
fi

# Check if package.json fix-node-version is reading from .nvmrc
if grep -q "To switch to Node.js.*cat .nvmrc" package.json; then
  echo -e "${GREEN}✓ package.json fix-node-version message correctly reads Node.js version from .nvmrc${NC}"
else
  echo -e "${RED}Error: package.json fix-node-version message should read Node.js version from .nvmrc${NC}"
  HAS_ERRORS=true
fi

# Check for any remaining hardcoded Node.js version references in shell scripts
echo -e "\n${YELLOW}Checking for remaining hardcoded Node.js version references in shell scripts...${NC}"
HARDCODED_REFS=$(grep -r "Node.js [0-9]\+" --include="*.sh" scripts/ | grep -v -E "(tr -d.*< .nvmrc|cat .nvmrc)" || true)
if [ -n "$HARDCODED_REFS" ]; then
  echo -e "${YELLOW}Potential hardcoded Node.js version references found:${NC}"
  echo "$HARDCODED_REFS"
  echo -e "${YELLOW}Please review these references and update them to use the version from .nvmrc${NC}"
  HAS_ERRORS=true
fi

# Final result
if [ "$HAS_ERRORS" = true ]; then
  echo -e "\n${RED}❌ Validation failed. Please update all Node.js version references to use .nvmrc.${NC}"
  exit 1
else
  echo -e "\n${GREEN}✅ All Node.js version references are correctly using .nvmrc as the source of truth.${NC}"
  exit 0
fi
