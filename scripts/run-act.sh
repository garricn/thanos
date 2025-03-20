#!/bin/bash

# This script runs GitHub Actions locally using act

set -e

# Store current Node.js version
CURRENT_NODE_VERSION=$(node -v)

# Create artifacts directory if it doesn't exist
mkdir -p ./artifacts

# Get tokens from the keychain if available
if command -v security &>/dev/null; then
  GITHUB_TOKEN=$(security find-generic-password -a "$USER" -s github-token -w 2>/dev/null || echo "")
  SONAR_TOKEN=$(security find-generic-password -a "$USER" -s sonar-token -w 2>/dev/null || echo "")
  CODECOV_TOKEN=$(security find-generic-password -a "$USER" -s codecov-token -w 2>/dev/null || echo "")
  SNYK_TOKEN=$(security find-generic-password -a "$USER" -s snyk-token -w 2>/dev/null || echo "")
else
  GITHUB_TOKEN=${GITHUB_TOKEN:-}
  SONAR_TOKEN=${SONAR_TOKEN:-}
  CODECOV_TOKEN=${CODECOV_TOKEN:-}
  SNYK_TOKEN=${SNYK_TOKEN:-}
fi

# Build the basic command with essential arguments
CMD=("act")

# Handle arguments to pass to act
if [[ $# -gt 0 ]]; then
  CMD+=("$@")
fi

# Add secrets if available
if [ -n "$GITHUB_TOKEN" ]; then
  CMD+=("-s" "GITHUB_TOKEN=$GITHUB_TOKEN")
fi
if [ -n "$SONAR_TOKEN" ]; then
  CMD+=("-s" "SONAR_TOKEN=$SONAR_TOKEN")
fi
if [ -n "$CODECOV_TOKEN" ]; then
  CMD+=("-s" "CODECOV_TOKEN=$CODECOV_TOKEN")
fi
if [ -n "$SNYK_TOKEN" ]; then
  CMD+=("-s" "SNYK_TOKEN=$SNYK_TOKEN")
fi

# Add other essential parameters
CMD+=(
  "--artifact-server-path" "./artifacts"
  "-P" "ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"
  "-v"
)

# Print command (without tokens)
echo "Running: act $* --artifact-server-path ./artifacts -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest -v"

# Run act passing all provided arguments
"${CMD[@]}"

# Restore Node.js version if it changed
AFTER_NODE_VERSION=$(node -v)
if [ "$CURRENT_NODE_VERSION" != "$AFTER_NODE_VERSION" ]; then
  echo "Node.js version changed during act execution. Restoring to $CURRENT_NODE_VERSION..."
  nvm use "$(echo "$CURRENT_NODE_VERSION" | sed 's/^v//')"
fi
