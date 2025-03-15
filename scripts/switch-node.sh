#!/bin/bash

# Script to switch to the Node.js version specified in .nvmrc
REQUIRED_VERSION=$(tr -d '\n\r' <.nvmrc)

echo "Switching to Node.js $REQUIRED_VERSION..."

# Try to load nvm from different possible locations
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
elif [ -s "$(brew --prefix nvm 2>/dev/null)/nvm.sh" ]; then
  # shellcheck disable=SC1091
  source "$(brew --prefix nvm)/nvm.sh"
else
  echo "Error: Could not find nvm. Please install nvm or switch to Node.js $REQUIRED_VERSION manually."
  exit 1
fi

# Switch to the required Node.js version
nvm use "$REQUIRED_VERSION"

# Verify the switch was successful
CURRENT_VERSION=$(node -v | sed 's/^v//' | cut -d. -f1)
if [ "$CURRENT_VERSION" = "$REQUIRED_VERSION" ]; then
  echo "✅ Successfully switched to Node.js $(node -v)"
else
  echo "❌ Failed to switch to Node.js $REQUIRED_VERSION. Current version: $(node -v)"
  exit 1
fi
