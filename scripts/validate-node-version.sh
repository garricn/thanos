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

# Check CI workflow file and setup-node composite action
CI_WORKFLOW_FILE=".github/workflows/ci.yml"
SETUP_NODE_ACTION_FILE=".github/actions/setup-node/action.yml"

echo -e "\n${YELLOW}Checking CI workflow and setup-node action...${NC}"

# First check if the setup-node composite action exists and reads from .nvmrc
if [ -f "$SETUP_NODE_ACTION_FILE" ]; then
  if grep -q "NODE_VERSION=\$(< .nvmrc)" "$SETUP_NODE_ACTION_FILE" || grep -q "node-version: \${{ steps.nvmrc.outputs.NODE_VERSION }}" "$SETUP_NODE_ACTION_FILE"; then
    echo -e "${GREEN}✅ setup-node composite action correctly reads Node.js version from .nvmrc${NC}"
    SETUP_NODE_OK=true
  else
    echo -e "${RED}Error: setup-node composite action does not read Node.js version from .nvmrc${NC}"
    echo -e "${YELLOW}    Please update the action to use the .nvmrc approach${NC}"
    HAS_ERRORS=true
    SETUP_NODE_OK=false
  fi
else
  echo -e "${YELLOW}⚠️ Warning: setup-node composite action not found at $SETUP_NODE_ACTION_FILE${NC}"
  SETUP_NODE_OK=false
fi

# Then check if the CI workflow uses either the composite action or reads .nvmrc directly
if [ -f "$CI_WORKFLOW_FILE" ]; then
  if [ "$SETUP_NODE_OK" = true ] && grep -q "uses: ./.github/actions/setup-node" "$CI_WORKFLOW_FILE"; then
    echo -e "${GREEN}✅ CI workflow correctly uses setup-node composite action${NC}"
  elif grep -q "NODE_VERSION=\$(cat .nvmrc" "$CI_WORKFLOW_FILE" || grep -q "NODE_VERSION=\$(tr -d.*<.*\.nvmrc" "$CI_WORKFLOW_FILE" || grep -q "NODE_VERSION=\$(< .nvmrc" "$CI_WORKFLOW_FILE"; then
    echo -e "${GREEN}✅ CI workflow correctly reads Node.js version from .nvmrc directly${NC}"
  else
    echo -e "${RED}Error: CI workflow does not use setup-node action or read from .nvmrc${NC}"
    echo -e "${YELLOW}    Please either:${NC}"
    echo -e "${YELLOW}    1. Use the setup-node composite action: uses: ./.github/actions/setup-node${NC}"
    echo -e "${YELLOW}    2. Or read directly from .nvmrc: \$(cat .nvmrc)${NC}"
    HAS_ERRORS=true
  fi

  # Make sure there are no hardcoded Node.js versions
  if grep -q "node-version: \"[0-9]" "$CI_WORKFLOW_FILE"; then
    echo -e "${RED}Error: CI workflow contains hardcoded Node.js versions${NC}"
    echo -e "${YELLOW}    Please update to use setup-node action or \${{ steps.nvmrc.outputs.NODE_VERSION }}${NC}"
    HAS_ERRORS=true
  fi
else
  echo -e "${YELLOW}⚠️ Warning: CI workflow file not found at $CI_WORKFLOW_FILE${NC}"
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
if [ -f "configs/docker/Dockerfile" ]; then
  echo -e "\n${YELLOW}Checking Dockerfile...${NC}"

  # Check if Dockerfile uses Node.js and if version matches
  if grep -q "FROM node:" "configs/docker/Dockerfile"; then
    DOCKERFILE_NODE_VERSION=$(grep "FROM node:" "configs/docker/Dockerfile" | head -1 | sed -E 's/FROM node:([0-9]+).*/\1/')

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

# Check Dockerfile.ci if it exists
if [ -f "configs/docker/Dockerfile.ci" ]; then
  echo -e "\n${YELLOW}Checking Dockerfile.ci...${NC}"

  # Check if Dockerfile.ci uses Node.js and if version matches
  if grep -q "FROM node:" "configs/docker/Dockerfile.ci"; then
    DOCKERFILE_CI_NODE_VERSION=$(grep "FROM node:" "configs/docker/Dockerfile.ci" | head -1 | sed -E 's/FROM node:([0-9]+).*/\1/')

    if [ "$DOCKERFILE_CI_NODE_VERSION" != "$NVMRC_VERSION" ]; then
      echo -e "${RED}❌ Error: Node.js version in Dockerfile.ci ($DOCKERFILE_CI_NODE_VERSION) does not match .nvmrc ($NVMRC_VERSION)${NC}"
      echo -e "${YELLOW}    Please update Dockerfile.ci to use version from .nvmrc${NC}"
      exit 1
    else
      echo -e "${GREEN}✅ Dockerfile.ci Node.js version matches .nvmrc${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ️ Dockerfile.ci does not use Node.js directly. Skipping check.${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️ No Dockerfile.ci found. Skipping check.${NC}"
fi

# Check docker-compose.yml if it exists
if [ -f "configs/docker/docker-compose.yml" ]; then
  echo -e "\n${YELLOW}Checking docker-compose.yml...${NC}"

  # Check if docker-compose.yml uses Node.js and if version matches
  if grep -q "NODE_VERSION:" "configs/docker/docker-compose.yml"; then
    COMPOSE_NODE_VERSION=$(grep -o "NODE_VERSION: [0-9]\+" "configs/docker/docker-compose.yml" | head -1 | sed -E 's/NODE_VERSION: ([0-9]+).*/\1/')

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

# Check docker-compose-ci.yml if it exists
if [ -f "configs/docker/docker-compose-ci.yml" ]; then
  echo -e "\n${YELLOW}Checking docker-compose-ci.yml...${NC}"

  # Check if docker-compose-ci.yml uses Node.js and if version matches
  if grep -q "NODE_VERSION:" "configs/docker/docker-compose-ci.yml"; then
    COMPOSE_CI_NODE_VERSION=$(grep -o "NODE_VERSION: [0-9]\+" "configs/docker/docker-compose-ci.yml" | head -1 | sed -E 's/NODE_VERSION: ([0-9]+).*/\1/')

    if [ "$COMPOSE_CI_NODE_VERSION" != "$NVMRC_VERSION" ]; then
      echo -e "${RED}❌ Error: Node.js version in docker-compose-ci.yml ($COMPOSE_CI_NODE_VERSION) does not match .nvmrc ($NVMRC_VERSION)${NC}"
      echo -e "${YELLOW}    Please update docker-compose-ci.yml to use version from .nvmrc${NC}"
      exit 1
    else
      echo -e "${GREEN}✅ docker-compose-ci.yml Node.js version matches .nvmrc${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ️ docker-compose-ci.yml does not use Node.js directly. Skipping check.${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️ No docker-compose-ci.yml found. Skipping check.${NC}"
fi

# Check Dockerfile.dev if it exists
if [ -f "configs/docker/Dockerfile.dev" ]; then
  echo -e "\n${YELLOW}Checking Dockerfile.dev...${NC}"

  # Check if Dockerfile.dev uses Node.js and if version matches
  if grep -q "NODE_VERSION=" "configs/docker/Dockerfile.dev"; then
    DOCKERFILE_DEV_NODE_VERSION=$(grep "NODE_VERSION=" "configs/docker/Dockerfile.dev" | head -1 | sed -E 's/.*NODE_VERSION=([0-9]+).*/\1/')

    if [ "$DOCKERFILE_DEV_NODE_VERSION" != "$NVMRC_VERSION" ]; then
      echo -e "${RED}❌ Error: Node.js version in Dockerfile.dev ($DOCKERFILE_DEV_NODE_VERSION) does not match .nvmrc ($NVMRC_VERSION)${NC}"
      echo -e "${YELLOW}    Please update Dockerfile.dev to use version from .nvmrc${NC}"
      exit 1
    else
      echo -e "${GREEN}✅ Dockerfile.dev Node.js version matches .nvmrc${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ️ Dockerfile.dev does not use Node.js directly. Skipping check.${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️ No Dockerfile.dev found. Skipping check.${NC}"
fi

# Final result
if [ "$HAS_ERRORS" = true ]; then
  echo -e "\n${RED}❌ Validation failed. Please update all Node.js version references to use .nvmrc.${NC}"
  exit 1
else
  echo -e "\n${GREEN}✅ All Node.js version references are correctly using .nvmrc as the source of truth.${NC}"
  exit 0
fi
