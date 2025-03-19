#!/bin/bash

# Script to remove Nx-related files from the project
set -e

echo "Removing Nx-related files and directories..."

# Remove Nx configuration files
rm -f nx.json
rm -f project.json
rm -f apps/web/project.json
rm -f apps/api/project.json
rm -f apps/**/project.json
rm -f jest.preset.js

# Remove Nx cache directories
rm -rf .nx
rm -rf node_modules/.cache/.nx

# Update .gitignore - ensure .nx is removed but also add it to be ignored in case it reappears
sed -i '' '/^\.nx/d' .gitignore
echo ".nx" >>.gitignore
echo "node_modules/.cache/.nx" >>.gitignore

echo "Updating .gitignore..."
# Add dist directories for individual apps
if ! grep -q "apps/web/dist" .gitignore; then
  echo "apps/web/dist" >>.gitignore
fi

if ! grep -q "apps/api/dist" .gitignore; then
  echo "apps/api/dist" >>.gitignore
fi

# Find any remaining Nx references in project files
echo "Checking for remaining Nx references in package.json files..."
find . -name "package.json" -type f -not -path "*/node_modules/*" -exec grep -l "nx" {} \; || true

# Check for any Nx dependencies that might be hidden in node_modules
echo "Checking for Nx dependencies in node_modules..."
find ./node_modules -type d -name "*nx*" -not -path "*/node_modules/*" | grep -v "node_modules/.bin" || true

echo "Nx has been removed from the project successfully!"
echo "Note: The .nx directory has been added to .gitignore in case it reappears"
echo ""
echo "To complete the migration:"
echo "1. Run 'npm install' to update dependencies"
echo "2. Run 'npm run build' to verify the build works correctly"
echo "3. Run 'npm test' to verify tests still work"
echo ""
echo "If the .nx directory continues to reappear, you can add this to your package.json scripts:"
echo '"cleanup:nx": "rm -rf .nx node_modules/.cache/.nx",'
echo "Then run 'npm run cleanup:nx' whenever needed"
