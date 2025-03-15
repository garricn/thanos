#!/bin/bash

# Kill any existing processes on ports 4200 and 3000
echo "Cleaning up any existing processes on ports 4200 and 3000..."
lsof -ti:4200,3000 | xargs kill -9 2>/dev/null || true

# Start servers in the background
echo "Starting servers..."
nx serve web &
WEB_PID=$!
nx serve api &
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
echo "Running E2E tests..."
nx run-many -t e2e --projects=web-e2e,api-e2e
EXIT_CODE=$?

# Exit with the test exit code
exit $EXIT_CODE
