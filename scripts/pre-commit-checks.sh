#!/bin/sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

printf "%bRunning pre-commit checks...%b\n" "$YELLOW" "$NC"

# Run lint-staged with custom config
LINT_STAGED_CONFIG_FILE=configs/lint/.lintstagedrc.json
if ! npx lint-staged --config "$LINT_STAGED_CONFIG_FILE"; then
  printf "%b❌ Linting failed%b\n" "$RED" "$NC"
  exit 1
fi

# Type check only staged files
STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.tsx?$' || true)
if [ -n "$STAGED_TS_FILES" ]; then
  printf "%bType checking staged TypeScript files...%b\n" "$YELLOW" "$NC"
  # shellcheck disable=SC2086
  if ! npx tsc --noEmit $STAGED_TS_FILES; then
    printf "%b❌ Type check failed%b\n" "$RED" "$NC"
    exit 1
  fi
fi

printf "%b✅ All pre-commit checks passed%b\n" "$GREEN" "$NC"
