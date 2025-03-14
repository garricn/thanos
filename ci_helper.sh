#!/bin/bash

# CI Helper Script
# This script helps with triggering and monitoring CI runs

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

# Function to check if GitHub token is set
check_token() {
  if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN is not set. Please set it in your environment.${NC}"
    echo "Run: source ~/.github_token_temp"
    exit 1
  fi
}

# Function to monitor a CI run
monitor_run() {
  local run_id=$1
  local wait_for_completion=$2
  
  echo -e "${BLUE}Monitoring CI run: $run_id${NC}"
  
  # Get run details
  RUN_DETAILS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${run_id}")
  
  RUN_STATUS=$(echo "$RUN_DETAILS" | grep -o '"status": "[^"]*"' | head -1 | awk -F'"' '{print $4}')
  RUN_CONCLUSION=$(echo "$RUN_DETAILS" | grep -o '"conclusion": "[^"]*"' | head -1 | awk -F'"' '{print $4}')
  RUN_URL=$(echo "$RUN_DETAILS" | grep -o '"html_url": "[^"]*"' | head -1 | awk -F'"' '{print $4}')
  
  echo "Status: $RUN_STATUS"
  echo "Conclusion: $RUN_CONCLUSION"
  echo "URL: $RUN_URL"
  
  # If wait_for_completion is true, poll until the run completes
  if [ "$wait_for_completion" = true ] && [ "$RUN_STATUS" != "completed" ]; then
    echo "Waiting for run to complete..."
    
    while [ "$RUN_STATUS" != "completed" ]; do
      echo -n "."
      sleep 10
      
      RUN_DETAILS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${run_id}")
      
      RUN_STATUS=$(echo "$RUN_DETAILS" | grep -o '"status": "[^"]*"' | head -1 | awk -F'"' '{print $4}')
      RUN_CONCLUSION=$(echo "$RUN_DETAILS" | grep -o '"conclusion": "[^"]*"' | head -1 | awk -F'"' '{print $4}')
    done
    
    echo -e "\nRun completed with conclusion: $RUN_CONCLUSION"
  fi
  
  # If the run failed, check for artifacts and download full logs
  if [ "$RUN_CONCLUSION" == "failure" ]; then
    echo -e "${RED}CI run failed!${NC}"
    
    # Get the jobs for this run
    echo "Fetching jobs for run $run_id..."
    JOBS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${run_id}/jobs")
    
    # Extract failed jobs
    echo -e "${YELLOW}Failed jobs:${NC}"
    echo "$JOBS" | grep -A 1 '"conclusion": "failure"' | grep '"name":' | awk -F'"' '{print $4}'
    
    # Create logs directory if it doesn't exist
    LOGS_DIR="logs_${run_id}"
    mkdir -p "$LOGS_DIR"
    
    # Download full logs for all jobs
    download_full_logs "$run_id" "$LOGS_DIR"
    
    # Check for artifacts
    echo "Checking for artifacts..."
    ARTIFACTS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${run_id}/artifacts")
    
    ARTIFACT_COUNT=$(echo "$ARTIFACTS" | grep -o '"total_count": [0-9]*' | awk '{print $2}')
    
    if [ "$ARTIFACT_COUNT" -gt 0 ]; then
      echo -e "${GREEN}Found $ARTIFACT_COUNT artifacts!${NC}"
      
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
  elif [ "$RUN_CONCLUSION" == "success" ]; then
    echo -e "${GREEN}CI run completed successfully!${NC}"
  fi
}

# Function to download full logs for all jobs in a run
download_full_logs() {
  local run_id=$1
  local logs_dir=$2
  
  echo -e "${BLUE}Downloading full logs for all jobs...${NC}"
  
  # Create a directory for full logs
  mkdir -p "${logs_dir}/full_logs"
  
  # Get all jobs for this run
  JOBS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${run_id}/jobs?per_page=100")
  
  # Extract job IDs and names
  echo "$JOBS" | jq -r '.jobs[] | "\(.id) \(.name)"' 2>/dev/null | while read -r JOB_ID JOB_NAME; do
    if [ -z "$JOB_ID" ]; then
      # If jq is not available, use grep and awk as fallback
      JOB_IDS=($(echo "$JOBS" | grep -o '"id": [0-9]*' | awk '{print $2}'))
      JOB_NAMES=($(echo "$JOBS" | grep -o '"name": "[^"]*"' | awk -F'"' '{print $4}' | sed 's/ /_/g'))
      
      for i in "${!JOB_IDS[@]}"; do
        JOB_ID=${JOB_IDS[$i]}
        JOB_NAME=${JOB_NAMES[$i]}
        
        # Sanitize job name for filename
        JOB_NAME=$(echo "$JOB_NAME" | tr -cd '[:alnum:]_-')
        
        echo "Downloading logs for job: $JOB_NAME (ID: $JOB_ID)"
        
        # Download logs using the API
        HTTP_STATUS=$(curl -s -w "%{http_code}" -o "${logs_dir}/full_logs/${JOB_NAME}_${JOB_ID}.log" \
          -H "Authorization: token $GITHUB_TOKEN" \
          -H "Accept: application/vnd.github.v3+json" \
          -L "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/jobs/${JOB_ID}/logs")
        
        if [ "$HTTP_STATUS" -ne 200 ]; then
          echo -e "${YELLOW}Failed to download logs for job $JOB_NAME (HTTP status: $HTTP_STATUS)${NC}"
        fi
      done
      
      break
    fi
    
    # Sanitize job name for filename
    JOB_NAME=$(echo "$JOB_NAME" | tr -cd '[:alnum:]_-')
    
    echo "Downloading logs for job: $JOB_NAME (ID: $JOB_ID)"
    
    # Download logs using the API
    HTTP_STATUS=$(curl -s -w "%{http_code}" -o "${logs_dir}/full_logs/${JOB_NAME}_${JOB_ID}.log" \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      -L "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/jobs/${JOB_ID}/logs")
    
    if [ "$HTTP_STATUS" -ne 200 ]; then
      echo -e "${YELLOW}Failed to download logs for job $JOB_NAME (HTTP status: $HTTP_STATUS)${NC}"
    fi
  done
  
  echo -e "${GREEN}Full logs downloaded to ${logs_dir}/full_logs/${NC}"
  
  # Create a summary file with links to the logs
  echo "# CI Run Logs Summary" > "${logs_dir}/logs_summary.md"
  echo "Run ID: $run_id" >> "${logs_dir}/logs_summary.md"
  echo "Run URL: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions/runs/${run_id}" >> "${logs_dir}/logs_summary.md"
  echo "" >> "${logs_dir}/logs_summary.md"
  echo "## Job Logs" >> "${logs_dir}/logs_summary.md"
  
  for log_file in "${logs_dir}"/full_logs/*.log; do
    if [ -f "$log_file" ]; then
      base_name=$(basename "$log_file")
      echo "- [$base_name]($log_file)" >> "${logs_dir}/logs_summary.md"
    fi
  done
}

# Function to get the latest workflow run
get_latest_run() {
  echo "Fetching latest workflow run..."
  LATEST_RUN=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=1")
  
  RUN_ID=$(echo "$LATEST_RUN" | grep -o '"id": [0-9]*' | head -1 | awk '{print $2}')
  
  echo "Latest run ID: $RUN_ID"
  monitor_run "$RUN_ID" false
}

# Function to trigger a new workflow run
trigger_workflow() {
  local branch=$1
  local workflow_id=$2
  
  if [ -z "$branch" ]; then
    branch="main"
  fi
  
  if [ -z "$workflow_id" ]; then
    workflow_id="ci.yml"
  fi
  
  echo -e "${BLUE}Triggering workflow $workflow_id on branch $branch...${NC}"
  
  RESPONSE=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${workflow_id}/dispatches" \
    -d "{\"ref\":\"${branch}\"}")
  
  # Check if the request was successful (GitHub returns 204 No Content on success)
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Workflow triggered successfully!${NC}"
    
    # Wait a moment for the workflow to start
    echo "Waiting for workflow to start..."
    sleep 5
    
    # Get the latest run
    get_latest_run
  else
    echo -e "${RED}Failed to trigger workflow.${NC}"
    echo "Response: $RESPONSE"
  fi
}

# Function to push changes and monitor CI
push_and_monitor() {
  local commit_message=$1
  local files_to_add=$2
  
  if [ -z "$commit_message" ]; then
    echo -e "${RED}Error: Commit message is required.${NC}"
    echo "Usage: ./ci_helper.sh push \"Commit message\" [files_to_add]"
    exit 1
  fi
  
  echo -e "${BLUE}Pushing changes and monitoring CI...${NC}"
  
  # Add files to git
  if [ -z "$files_to_add" ]; then
    echo "Adding all changed files..."
    git add .
  else
    echo "Adding specified files: $files_to_add"
    git add $files_to_add
  fi
  
  # Commit changes
  echo "Committing with message: $commit_message"
  git commit -m "$commit_message"
  
  # Push changes
  echo "Pushing changes..."
  git push
  
  # Wait a moment for the workflow to start
  echo "Waiting for CI to start..."
  sleep 5
  
  # Monitor the CI run
  get_latest_run
}

# Main function
main() {
  echo -e "${BLUE}CI Helper Script${NC}"
  check_token
  
  # Parse command line arguments
  case "$1" in
    monitor)
      if [ -z "$2" ]; then
        get_latest_run
      else
        monitor_run "$2" true
      fi
      ;;
    logs)
      if [ -z "$2" ]; then
        echo -e "${YELLOW}Error: Run ID is required for downloading logs.${NC}"
        echo "Usage: ./ci_helper.sh logs <run_id>"
        exit 1
      else
        LOGS_DIR="logs_${2}"
        mkdir -p "$LOGS_DIR"
        download_full_logs "$2" "$LOGS_DIR"
      fi
      ;;
    trigger)
      trigger_workflow "$2" "$3"
      ;;
    push)
      push_and_monitor "$2" "$3"
      ;;
    *)
      echo -e "${YELLOW}Usage:${NC}"
      echo "  ./ci_helper.sh monitor [run_id]  - Monitor a CI run (latest if no ID provided)"
      echo "  ./ci_helper.sh logs <run_id>     - Download full logs for a CI run"
      echo "  ./ci_helper.sh trigger [branch] [workflow_id]  - Trigger a new workflow run"
      echo "  ./ci_helper.sh push \"Commit message\" [files_to_add]  - Push changes and monitor CI"
      ;;
  esac
}

# Run the main function
main "$@" 