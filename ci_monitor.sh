#!/bin/bash

# CI Monitor Script
# This script checks for CI failures and downloads artifacts if available

# Set your GitHub token (make sure this is set in your environment)
# export GITHUB_TOKEN="your_token_here"

# Repository details
REPO_OWNER="garricn"
REPO_NAME="thanos"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}CI Monitor Script${NC}"
echo "Checking for CI failures in ${REPO_OWNER}/${REPO_NAME}..."

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}Error: GITHUB_TOKEN is not set. Please set it in your environment.${NC}"
  exit 1
fi

# Get the latest workflow run
echo "Fetching latest workflow run..."
LATEST_RUN=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=1")

# Extract run ID and status
RUN_ID=$(echo "$LATEST_RUN" | grep -o '"id": [0-9]*' | head -1 | awk '{print $2}')
RUN_STATUS=$(echo "$LATEST_RUN" | grep -o '"status": "[^"]*"' | head -1 | awk -F'"' '{print $4}')
RUN_CONCLUSION=$(echo "$LATEST_RUN" | grep -o '"conclusion": "[^"]*"' | head -1 | awk -F'"' '{print $4}')
RUN_URL=$(echo "$LATEST_RUN" | grep -o '"html_url": "[^"]*"' | head -1 | awk -F'"' '{print $4}')

echo "Latest run: $RUN_ID"
echo "Status: $RUN_STATUS"
echo "Conclusion: $RUN_CONCLUSION"
echo "URL: $RUN_URL"

# Check if the run failed
if [ "$RUN_CONCLUSION" == "failure" ]; then
  echo -e "${RED}CI run failed!${NC}"
  
  # Get the jobs for this run
  echo "Fetching jobs for run $RUN_ID..."
  JOBS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${RUN_ID}/jobs")
  
  # Extract failed jobs
  echo -e "${YELLOW}Failed jobs:${NC}"
  echo "$JOBS" | grep -A 1 '"conclusion": "failure"' | grep '"name":' | awk -F'"' '{print $4}'
  
  # Check for artifacts
  echo "Checking for artifacts..."
  ARTIFACTS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${RUN_ID}/artifacts")
  
  ARTIFACT_COUNT=$(echo "$ARTIFACTS" | grep -o '"total_count": [0-9]*' | awk '{print $2}')
  
  if [ "$ARTIFACT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}Found $ARTIFACT_COUNT artifacts!${NC}"
    
    # Create logs directory if it doesn't exist
    LOGS_DIR="logs_${RUN_ID}"
    mkdir -p "$LOGS_DIR"
    
    # Extract artifact URLs and download them
    echo "$ARTIFACTS" | grep -o '"archive_download_url": "[^"]*"' | awk -F'"' '{print $4}' | while read -r URL; do
      ARTIFACT_NAME=$(echo "$URL" | awk -F'/' '{print $NF}')
      echo "Downloading artifact: $ARTIFACT_NAME"
      curl -s -L -H "Authorization: token $GITHUB_TOKEN" "$URL" -o "${LOGS_DIR}/${ARTIFACT_NAME}.zip"
      
      # Unzip the artifact
      unzip -q "${LOGS_DIR}/${ARTIFACT_NAME}.zip" -d "${LOGS_DIR}/${ARTIFACT_NAME}"
      rm "${LOGS_DIR}/${ARTIFACT_NAME}.zip"
    done
    
    echo -e "${GREEN}Artifacts downloaded to ${LOGS_DIR}/${NC}"
  else
    echo -e "${YELLOW}No artifacts found for this run.${NC}"
  fi
  
  echo -e "${BLUE}View the full run details at: ${RUN_URL}${NC}"
else
  echo -e "${GREEN}CI run completed successfully!${NC}"
fi 