#!/bin/bash

# Start servers in the background
echo "Starting web server..."
nx serve web &
WEB_PID=$!

echo "Starting API server..."
nx serve api &
API_PID=$!

# Function to clean up servers on exit
cleanup() {
  echo "Shutting down servers..."
  kill $WEB_PID $API_PID 2>/dev/null
  exit
}

# Set up trap to ensure servers are killed when script exits
trap cleanup EXIT INT TERM

# Wait for servers to be ready
echo "Waiting for servers to be ready..."
npx wait-on http://localhost:4200 http://localhost:3000 -t 60000

# Run E2E tests
echo "Running E2E tests..."
nx run-many -t e2e --projects=web-e2e,api-e2e

# Capture the exit code
EXIT_CODE=$?

# Exit with the same code as the tests
exit $EXIT_CODE
