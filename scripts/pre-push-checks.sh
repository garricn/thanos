#!/bin/sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

printf "%bRunning pre-push checks...%b\n" "$YELLOW" "$NC"

# Check Node.js version
printf "\n%bChecking Node.js version...%b\n" "$YELLOW" "$NC"
if ! npm run validate:node-version; then
  printf "%b❌ Node.js version check failed%b\n" "$RED" "$NC"
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
