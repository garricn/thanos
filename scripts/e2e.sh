#!/bin/bash

# Set -e to make the script exit immediately if any command fails
set -eo pipefail

# Kill any existing processes on ports 4200 and 3000
echo "Cleaning up any existing processes on ports 4200 and 3000..."
lsof -ti:4200,3000 | xargs kill -9 2>/dev/null || true

# Start servers in the background
echo "Starting servers..."
npm run start:web &
WEB_PID=$!
npm run start:api &
API_PID=$!

# Function to clean up servers on exit
# shellcheck disable=SC2317
cleanup() {
  echo "Shutting down servers..."
  kill "$WEB_PID" "$API_PID" 2>/dev/null || true
  lsof -ti:4200,3000 | xargs kill -9 2>/dev/null || true
  echo "All servers have been shut down."
}

# Set up trap to ensure servers are killed when script exits
trap cleanup EXIT INT TERM

# Wait for servers to be ready
echo "Waiting for servers to be ready..."
npx wait-on http://localhost:4200 http://localhost:3000 -t 60000

# Run E2E tests
echo "Running Web E2E tests..."
cd apps/web/e2e && npx cypress run
WEB_EXIT_CODE=$?
cd -

echo "Running API E2E tests..."
cd apps/api/e2e && npx jest --verbose
API_EXIT_CODE=$?
cd -

# Determine final exit code
if [ $WEB_EXIT_CODE -ne 0 ] || [ $API_EXIT_CODE -ne 0 ]; then
  echo "E2E tests failed!"
  echo "Web E2E exit code: $WEB_EXIT_CODE"
  echo "API E2E exit code: $API_EXIT_CODE"
  exit 1
else
  echo "All E2E tests passed!"
  exit 0
fi
