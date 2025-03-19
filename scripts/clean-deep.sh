#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display help message
show_help() {
  echo -e "${GREEN}Thanos Deep Clean Script${NC}"
  echo -e "This script performs a deep clean of the project, removing all generated files and reinstalling dependencies."
  echo
  echo -e "Usage: ./scripts/clean-deep.sh [options]"
  echo
  echo -e "Options:"
  echo -e "  --help      Show this help message"
  echo -e "  --dry-run   Show what would be done without making any changes"
  echo -e "  --force     Bypass the Node.js version check (not recommended)"
  echo
  echo -e "Example:"
  echo -e "  ./scripts/clean-deep.sh --dry-run"
  echo
  exit 0
}

# Parse command line arguments
DRY_RUN=false
FORCE=false
for arg in "$@"; do
  case $arg in
    --help)
      show_help
      ;;
    --dry-run)
      DRY_RUN=true
      echo -e "${YELLOW}Running in dry-run mode. No changes will be made.${NC}"
      ;;
    --force)
      FORCE=true
      echo -e "${YELLOW}Force mode enabled. Will bypass Node.js version check.${NC}"
      ;;
  esac
done

# Check Node.js version
echo -e "${YELLOW}Checking Node.js version...${NC}"
# Read required Node.js version from .nvmrc file
REQUIRED_NODE_VERSION=$(tr -d '\n\r' <.nvmrc)
CURRENT_NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)

if [ "$CURRENT_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ] && [ "$FORCE" != true ]; then
  echo -e "${RED}Error: This project requires Node.js version $REQUIRED_NODE_VERSION, but you are using $(node -v).${NC}"
  echo -e "Please run: ${YELLOW}source ./scripts/switch-node.sh${NC}"
  echo -e "Or use ${YELLOW}--force${NC} to bypass this check (not recommended)."
  exit 1
else
  if [ "$CURRENT_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${YELLOW}⚠️ Warning: Using Node.js $(node -v) instead of the recommended v$REQUIRED_NODE_VERSION${NC}"
  else
    echo -e "${GREEN}✓ Using correct Node.js version: $(node -v)${NC}"
  fi
fi

# Start deep clean
echo -e "\n${YELLOW}🧹 Starting deep clean...${NC}"

# Step 1: Remove directories and files
echo -e "\n${YELLOW}Step 1: Removing generated files and directories...${NC}"
if [ "$DRY_RUN" = true ]; then
  echo "Would remove: node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs"
else
  rm -rf node_modules package-lock.json dist tmp coverage .nyc_output ./*.log logs
  echo -e "${GREEN}✓ Removed generated files and directories${NC}"
fi

# Step 2: Clean npm cache
echo -e "\n${YELLOW}Step 2: Cleaning npm cache...${NC}"
if [ "$DRY_RUN" = true ]; then
  echo "Would run: npm cache clean --force"
else
  npm cache clean --force
  echo -e "${GREEN}✓ Cleaned npm cache${NC}"
fi

# Step 3: Clear Jest cache
echo -e "\n${YELLOW}Step 3: Clearing Jest cache...${NC}"
if [ "$DRY_RUN" = true ]; then
  echo "Would run: npx jest --clearCache"
else
  npx jest --clearCache 2>/dev/null || true
  echo -e "${GREEN}✓ Cleared Jest cache${NC}"
fi

# Step 4: Display Node.js and npm versions
echo -e "\n${YELLOW}Step 4: Checking environment...${NC}"
echo -e "Using Node.js $(node -v) and npm $(npm -v)"

# Step 5: Install dependencies
echo -e "\n${YELLOW}Step 5: Installing dependencies...${NC}"
if [ "$DRY_RUN" = true ]; then
  echo "Would run: npm install"
else
  npm install
  echo -e "${GREEN}✓ Installed dependencies${NC}"
fi

# Step 6: Completion
echo -e "\n${GREEN}✅ Deep cleaning complete. Environment reset to a clean state.${NC}"
