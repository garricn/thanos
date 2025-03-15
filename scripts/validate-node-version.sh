#!/bin/bash

# Script to validate that all Node.js version references are in sync with .nvmrc
# This ensures that the single source of truth (.nvmrc) is respected throughout the project

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Validating Node.js version references...${NC}"

# Read the required Node.js version from .nvmrc
if [ ! -f .nvmrc ]; then
  echo -e "${RED}Error: .nvmrc file not found. This file should be the single source of truth for Node.js version.${NC}"
  exit 1
fi

NVMRC_VERSION=$(tr -d '\n\r' <.nvmrc)
echo -e "✅ Found Node.js version $NVMRC_VERSION in .nvmrc"

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

# Check CI workflow file
CI_WORKFLOW_FILE=".github/workflows/ci.yml"
if [ -f "$CI_WORKFLOW_FILE" ]; then
  echo -e "\n${YELLOW}Checking $CI_WORKFLOW_FILE...${NC}"

  # Verify that the file uses the .nvmrc approach
  if grep -q "NODE_VERSION=\$(cat .nvmrc" "$CI_WORKFLOW_FILE" || grep -q "NODE_VERSION=\$(tr -d.*<.*\.nvmrc" "$CI_WORKFLOW_FILE"; then
    echo -e "${GREEN}✅ $CI_WORKFLOW_FILE correctly reads Node.js version from .nvmrc${NC}"
  else
    echo -e "${RED}Error: $CI_WORKFLOW_FILE does not read Node.js version from .nvmrc${NC}"
    echo -e "${YELLOW}    Please update the file to use the .nvmrc approach${NC}"
    HAS_ERRORS=true
  fi

  # Make sure there are no hardcoded Node.js versions
  if grep -q "node-version: \"[0-9]" "$CI_WORKFLOW_FILE"; then
    echo -e "${RED}Error: $CI_WORKFLOW_FILE contains hardcoded Node.js versions${NC}"
    echo -e "${YELLOW}    Please update the file to use \${{ steps.nvmrc.outputs.NODE_VERSION }}""${NC}"
    HAS_ERRORS=true
  fi
else
  echo -e "${YELLOW}⚠️ Warning: $CI_WORKFLOW_FILE not found. Skipping check.${NC}"
fi

# Check package.json for engines field
if [ -f "package.json" ]; then
  echo -e "\n${YELLOW}Checking package.json...${NC}"

  # Check if engines field exists and has correct Node.js version
  NODE_ENGINE=$(node -e "try { const pkg = require('./package.json'); console.log(pkg.engines && pkg.engines.node || 'not-set'); } catch(e) { console.log('error'); }")

  if [ "$NODE_ENGINE" = "error" ]; then
    echo -e "${RED}❌ Error reading package.json${NC}"
    exit 1
  elif [ "$NODE_ENGINE" = "not-set" ]; then
    echo -e "${YELLOW}⚠️ Warning: No engines.node field in package.json${NC}"
    echo -e "${YELLOW}    Consider adding: \"engines\": { \"node\": \"$NVMRC_VERSION\" }${NC}"
  elif [ "$NODE_ENGINE" != "$NVMRC_VERSION" ] && [ "$NODE_ENGINE" != ">=$NVMRC_VERSION" ] && [ "$NODE_ENGINE" != "^$NVMRC_VERSION" ]; then
    echo -e "${RED}❌ Error: Node.js version in package.json ($NODE_ENGINE) does not match .nvmrc ($NVMRC_VERSION)${NC}"
    echo -e "${YELLOW}    Please update package.json to use version from .nvmrc${NC}"
    exit 1
  else
    echo -e "${GREEN}✅ package.json engines.node is compatible with .nvmrc${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ Warning: package.json not found. Skipping check.${NC}"
fi

# Check Dockerfile if it exists
if [ -f "Dockerfile" ]; then
  echo -e "\n${YELLOW}Checking Dockerfile...${NC}"

  # Check if Dockerfile uses Node.js and if version matches
  if grep -q "FROM node:" "Dockerfile"; then
    DOCKERFILE_NODE_VERSION=$(grep "FROM node:" "Dockerfile" | head -1 | sed -E 's/FROM node:([0-9]+).*/\1/')

    if [ "$DOCKERFILE_NODE_VERSION" != "$NVMRC_VERSION" ]; then
      echo -e "${RED}❌ Error: Node.js version in Dockerfile ($DOCKERFILE_NODE_VERSION) does not match .nvmrc ($NVMRC_VERSION)${NC}"
      echo -e "${YELLOW}    Please update Dockerfile to use version from .nvmrc${NC}"
      exit 1
    else
      echo -e "${GREEN}✅ Dockerfile Node.js version matches .nvmrc${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ️ Dockerfile does not use Node.js directly. Skipping check.${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️ No Dockerfile found. Skipping check.${NC}"
fi

# Check docker-compose.yml if it exists
if [ -f "docker-compose.yml" ]; then
  echo -e "\n${YELLOW}Checking docker-compose.yml...${NC}"

  # This is a simplified check and might need adjustment based on your docker-compose structure
  if grep -q "image: node:" "docker-compose.yml"; then
    COMPOSE_NODE_VERSION=$(grep "image: node:" "docker-compose.yml" | head -1 | sed -E 's/.*image: node:([0-9]+).*/\1/')

    if [ "$COMPOSE_NODE_VERSION" != "$NVMRC_VERSION" ]; then
      echo -e "${RED}❌ Error: Node.js version in docker-compose.yml ($COMPOSE_NODE_VERSION) does not match .nvmrc ($NVMRC_VERSION)${NC}"
      echo -e "${YELLOW}    Please update docker-compose.yml to use version from .nvmrc${NC}"
      exit 1
    else
      echo -e "${GREEN}✅ docker-compose.yml Node.js version matches .nvmrc${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ️ docker-compose.yml does not use Node.js directly. Skipping check.${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️ No docker-compose.yml found. Skipping check.${NC}"
fi

# Final result
if [ "$HAS_ERRORS" = true ]; then
  echo -e "\n${RED}❌ Validation failed. Please update all Node.js version references to use .nvmrc.${NC}"
  exit 1
else
  echo -e "\n${GREEN}✅ All Node.js version references are correctly using .nvmrc as the source of truth.${NC}"
  exit 0
fi
