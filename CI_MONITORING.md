# CI Monitoring Tools

This repository includes tools to help monitor CI runs and automatically download logs and artifacts when failures occur.

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

2. **Make the scripts executable**:

   ```bash
   chmod +x ci_helper.sh ci_monitor.sh
   ```

## Using the CI Helper Script

The `ci_helper.sh` script provides several commands to help with CI monitoring:

### Monitor the Latest CI Run

```bash
./ci_helper.sh monitor
```

This will fetch information about the latest CI run, including its status, conclusion, and any available artifacts.

### Monitor a Specific CI Run

```bash
./ci_helper.sh monitor <run_id>
```

Replace `<run_id>` with the ID of the CI run you want to monitor.

### Trigger a New CI Run

```bash
./ci_helper.sh trigger [branch] [workflow_id]
```

This will trigger a new workflow run on the specified branch (defaults to `main`) and workflow (defaults to `ci.yml`).

### Push Changes and Monitor CI

```bash
./ci_helper.sh push "Commit message" [files_to_add]
```

This will:

1. Add the specified files (or all changed files if none are specified)
2. Commit them with the provided message
3. Push the changes to the remote repository
4. Monitor the resulting CI run

## Using the CI Monitor Script

The `ci_monitor.sh` script is a simpler version that only checks the latest CI run:

```bash
./ci_monitor.sh
```

## Workflow Artifacts

When CI jobs fail, artifacts are automatically uploaded and can be downloaded using these scripts. The artifacts are stored in directories named `logs_<run_id>/` and contain:

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
