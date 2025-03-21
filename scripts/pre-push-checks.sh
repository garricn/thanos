#!/bin/sh

# Colors for output
YELLOW="\033[1;33m"
RED="\033[0;31m"
GREEN="\033[0;32m"
NC="\033[0m" # No Color

printf "%bRunning pre-push checks...%b\n" "$YELLOW" "$NC"

# Check Node.js version
printf "%bChecking Node.js version...%b\n" "$YELLOW" "$NC"
if ! npm run node:version; then
  printf "%bNode.js version check failed%b\n" "$RED" "$NC"
  exit 1
fi

# Run type checking
printf "\n%bRunning type check...%b\n" "$YELLOW" "$NC"
if ! npm run type-check; then
  printf "%b❌ Type check failed%b\n" "$RED" "$NC"
  exit 1
fi

# Run linting
printf "\n%bRunning linters...%b\n" "$YELLOW" "$NC"
if ! npm run lint; then
  printf "%b❌ Linting failed%b\n" "$RED" "$NC"
  exit 1
fi

# Run unit tests
printf "\n%bRunning unit tests...%b\n" "$YELLOW" "$NC"
if ! npm run test:unit; then
  printf "%b❌ Unit tests failed%b\n" "$RED" "$NC"
  exit 1
fi

printf "\n%b✅ All pre-push checks passed%b\n" "$GREEN" "$NC"
