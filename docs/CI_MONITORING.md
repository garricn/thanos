# CI Monitoring Tools

This repository includes a script to help monitor CI runs and automatically download logs and artifacts when failures occur.

## Table of Contents

- [Setup](#setup)
- [Using the CI Helper Script](#using-the-ci-helper-script)
  - [Monitor the Latest CI Run](#monitor-the-latest-ci-run)
  - [Monitor a Specific CI Run](#monitor-a-specific-ci-run)
  - [Trigger a New CI Run](#trigger-a-new-ci-run)
- [Workflow Artifacts](#workflow-artifacts)
- [Troubleshooting](#troubleshooting)

## Setup

1. **Set up your GitHub token**:

   Create a file to store your GitHub token:

   ```bash
   echo 'export GITHUB_TOKEN="your_token_here"' > ~/.github_token_temp
   ```

   Replace `your_token_here` with your actual GitHub Personal Access Token.

   Load the token into your environment:

   ```bash
   source ~/.github_token_temp
   ```

2. **Make the script executable**:

   ```bash
   chmod +x scripts/ci_helper.sh
   ```

## Using the CI Helper Script

The `ci_helper.sh` script provides several commands to help with CI monitoring:

### Monitor the Latest CI Run

```bash
./scripts/ci_helper.sh monitor
```

This will fetch information about the latest CI run, including its status, conclusion, and any available artifacts.

### Monitor a Specific CI Run

```bash
./scripts/ci_helper.sh monitor <run_id>
```

Replace `<run_id>` with the ID of the CI run you want to monitor.

### Trigger a New CI Run

```bash
.scripts//ci_helper.sh trigger [branch] [workflow_id]
```

This will trigger a new workflow run on the specified branch (defaults to `main`) and workflow (defaults to `ci.yml`).

## Workflow Artifacts

When CI jobs fail, artifacts are automatically uploaded and can be downloaded using the script. The artifacts are stored in directories named `logs_<run_id>/` and contain:

- `job_status.txt`: Summary of the status of each job
- `run_info.txt`: Information about the CI run
- `runner_info.txt`: Information about the GitHub Actions runner environment

## Troubleshooting

If you encounter issues with the scripts:

1. Make sure your GitHub token is set:

   ```bash
   source ~/.github_token_temp
   ```

2. Check if the token has the necessary permissions (repo, workflow)

3. Verify that you can access the GitHub API:

   ```bash
   curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/user" | grep login
   ```
