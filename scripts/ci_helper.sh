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
  local run_id="$1"
  local max_attempts=60
  local attempt=0
  local status=""

  echo -e "${BLUE}Monitoring CI run with ID: $run_id${NC}"

  while [ "$attempt" -lt "$max_attempts" ]; do
    status=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs/$run_id" |
      grep -o '"status": "[^"]*"' | cut -d'"' -f4)

    conclusion=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs/$run_id" |
      grep -o '"conclusion": "[^"]*"' | cut -d'"' -f4)

    if [ "$status" = "completed" ]; then
      if [ "$conclusion" = "success" ]; then
        echo -e "${GREEN}CI run completed successfully!${NC}"
      else
        echo -e "${RED}CI run completed with status: $conclusion${NC}"
      fi
      return
    fi

    echo -e "${YELLOW}CI run status: $status (attempt $attempt/$max_attempts)${NC}"
    sleep 10
    attempt=$((attempt + 1))
  done

  echo -e "${RED}Timed out waiting for CI run to complete.${NC}"
}

# Function to get job details for a run
get_job_details() {
  local run_id="$1"

  echo -e "${BLUE}Getting job details for run ID: $run_id${NC}"

  JOBS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs/$run_id/jobs")

  # Use mapfile to store job IDs and names
  mapfile -t JOB_IDS < <(echo "$JOBS" | grep -o '"id": [0-9]*' | awk '{print $2}')
  mapfile -t JOB_NAMES < <(echo "$JOBS" | grep -o '"name": "[^"]*"' | awk -F'"' '{print $4}' | sed 's/ /_/g')

  echo -e "${GREEN}Found ${#JOB_IDS[@]} jobs:${NC}"

  for i in "${!JOB_IDS[@]}"; do
    echo -e "${YELLOW}${JOB_NAMES[$i]}${NC} (ID: ${JOB_IDS[$i]})"
  done
}

# Function to download logs for a job
download_logs() {
  local job_id="$1"
  local job_name="$2"
  local logs_dir="$3"

  echo -e "${BLUE}Downloading logs for job: $job_name (ID: $job_id)${NC}"

  mkdir -p "$logs_dir"

  curl -s -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3.raw" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/jobs/$job_id/logs" \
    >"$logs_dir/$job_name.log"

  echo -e "${GREEN}Logs saved to: $logs_dir/$job_name.log${NC}"
}

# Function to download all logs for a run
download_all_logs() {
  local run_id="$1"
  local logs_dir="logs/run_$run_id"

  echo -e "${BLUE}Downloading all logs for run ID: $run_id${NC}"

  mkdir -p "$logs_dir"

  get_job_details "$run_id"

  for i in "${!JOB_IDS[@]}"; do
    download_logs "${JOB_IDS[$i]}" "${JOB_NAMES[$i]}" "$logs_dir"
  done

  # Create a summary file
  {
    echo "# CI Run Logs Summary"
    echo "Run ID: $run_id"
    echo "Downloaded at: $(date)"
    echo ""
    echo "## Jobs"
    for i in "${!JOB_IDS[@]}"; do
      echo "- ${JOB_NAMES[$i]} (ID: ${JOB_IDS[$i]})"
    done
  } >"$logs_dir/logs_summary.md"

  echo -e "${GREEN}All logs downloaded to: $logs_dir${NC}"
  echo -e "${GREEN}Summary available at: $logs_dir/logs_summary.md${NC}"
}

# Function to trigger a CI run
trigger_ci() {
  local branch="$1"

  echo -e "${BLUE}Triggering CI run on branch: $branch${NC}"

  # Create an empty commit to trigger CI
  git checkout "$branch"
  git commit --allow-empty -m "Trigger CI run"

  if git push origin "$branch"; then
    echo -e "${GREEN}CI run triggered successfully!${NC}"

    # Get the latest run ID
    sleep 5 # Wait a bit for the run to be created
    run_id=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?branch=$branch&per_page=1" |
      grep -o '"id": [0-9]*' | head -1 | awk '{print $2}')

    echo -e "${GREEN}Latest run ID: $run_id${NC}"
    echo -e "${GREEN}View run at: https://github.com/$REPO_OWNER/$REPO_NAME/actions/runs/$run_id${NC}"

    # Ask if user wants to monitor the run
    read -r -p "Do you want to monitor this run? (y/n) " monitor
    if [[ "$monitor" =~ ^[Yy]$ ]]; then
      monitor_run "$run_id"
    fi
  else
    echo -e "${RED}Failed to trigger CI run.${NC}"
  fi
}

# Function to create a PR
create_pr() {
  local branch="$1"
  local title="$2"
  local body="$3"

  echo -e "${BLUE}Creating PR from branch: $branch${NC}"

  # Create PR using GitHub API
  response=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls" \
    -d "{\"title\":\"$title\",\"body\":\"$body\",\"head\":\"$branch\",\"base\":\"main\"}")

  pr_url=$(echo "$response" | grep -o '"html_url": "[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$pr_url" ]; then
    echo -e "${GREEN}PR created successfully!${NC}"
    echo -e "${GREEN}PR URL: $pr_url${NC}"
  else
    echo -e "${RED}Failed to create PR. Response:${NC}"
    echo "$response"
  fi
}

# Function to commit and push changes
commit_and_push() {
  local branch="$1"
  local message="$2"
  local files_to_add="$3"

  echo -e "${BLUE}Committing changes to branch: $branch${NC}"

  # Create branch if it doesn't exist
  if ! git rev-parse --verify "$branch" &>/dev/null; then
    git checkout -b "$branch"
  else
    git checkout "$branch"
  fi

  # Add files
  git add "$files_to_add"

  # Commit
  git commit -m "$message"

  # Push
  if git push origin "$branch"; then
    echo -e "${GREEN}Changes pushed successfully!${NC}"
    return 0
  else
    echo -e "${RED}Failed to push changes.${NC}"
    return 1
  fi
}

# Main function
main() {
  check_token

  echo -e "${BLUE}CI Helper Script${NC}"
  echo "1. Trigger CI run"
  echo "2. Monitor CI run"
  echo "3. Download logs for a run"
  echo "4. Create PR"
  echo "5. Commit and push changes"
  echo "6. Exit"

  read -r -p "Enter your choice: " choice

  case "$choice" in
    1)
      read -r -p "Enter branch name: " branch
      trigger_ci "$branch"
      ;;
    2)
      read -r -p "Enter run ID: " run_id
      monitor_run "$run_id"
      ;;
    3)
      read -r -p "Enter run ID: " run_id
      download_all_logs "$run_id"
      ;;
    4)
      read -r -p "Enter branch name: " branch
      read -r -p "Enter PR title: " title
      read -r -p "Enter PR body: " body
      create_pr "$branch" "$title" "$body"
      ;;
    5)
      read -r -p "Enter branch name: " branch
      read -r -p "Enter commit message: " message
      read -r -p "Enter files to add (space-separated): " files
      commit_and_push "$branch" "$message" "$files"
      ;;
    6)
      echo -e "${GREEN}Exiting.${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice.${NC}"
      ;;
  esac
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main
fi
