#!/bin/bash

# This script runs GitHub Actions locally using act

set -e

# Create artifacts directory if it doesn't exist
mkdir -p ./artifacts

# Get GitHub token from the keychain if available
if command -v security &>/dev/null; then
  GITHUB_TOKEN=$(security find-generic-password -a "$USER" -s github-token -w 2>/dev/null || echo "")
else
  GITHUB_TOKEN=${GITHUB_TOKEN:-}
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

# Add other essential parameters
CMD+=(
  "--artifact-server-path" "./artifacts"
  "-P" "ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"
)

# Print command (without token)
echo "Running: act $* --artifact-server-path ./artifacts -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"

# Run act passing all provided arguments
"${CMD[@]}"
