# SonarCloud Local Testing with Act

## Issue Description

When running SonarCloud analysis locally using `act`, the scanner fails with a `NullPointerException`:

```
Caused by: java.lang.NullPointerException: Cannot invoke "String.startsWith(String)" because "ref" is null
```

This error occurs in the SonarCloud scanner's GitHub Actions integration code, specifically in the `GithubActions.extractBranchFromRef` method. The scanner is unable to properly access branch information when running locally with `act`.

## Important Limitations

1. **Free Tier Restrictions**

   - Free tier only includes scans on the `main` branch
   - Limited to 14 scans per day
   - Only works with public repositories
   - Private repositories require a paid plan

2. **Solution Found**
   - Make the repository public to work with the free tier
   - Merge changes to `main` branch for scanning
   - This bypasses the need for complex branch configuration

## Current Configuration

### Workflow File (.github/workflows/ci.yml)

```yaml
- name: Set branch name
  run: |
    if [ "$ACT" = "true" ]; then
      BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
      echo "SONAR_BRANCH_NAME=$BRANCH_NAME" >> $GITHUB_ENV
      echo "GITHUB_REF=refs/heads/$BRANCH_NAME" >> $GITHUB_ENV
      echo "GITHUB_REF_NAME=$BRANCH_NAME" >> $GITHUB_ENV
      echo "GITHUB_HEAD_REF=$BRANCH_NAME" >> $GITHUB_ENV
      echo "GITHUB_BASE_REF=main" >> $GITHUB_ENV
      echo "GITHUB_EVENT_NAME=pull_request" >> $GITHUB_ENV
    fi
```

### SonarCloud Configuration (sonar-project.properties)

```properties
# Branch analysis
sonar.branch.autoconfig=true
sonar.branch.name=${env.SONAR_BRANCH_NAME}
sonar.branch.target=main
```

## Solutions Tried

1. **Explicit Branch Name Setting**

   - Added step to set branch name when running with `act`
   - Set `SONAR_BRANCH_NAME` environment variable
   - Set GitHub context variables (`GITHUB_REF`, `GITHUB_REF_NAME`, `GITHUB_HEAD_REF`)

2. **Pull Request Context Simulation**

   - Added `GITHUB_BASE_REF=main`
   - Added `GITHUB_EVENT_NAME=pull_request`
   - Attempted to simulate a PR context for branch analysis

3. **Environment Variable Configuration**

   - Added `SONAR_BRANCH` and `SONAR_BRANCH_TARGET` to the SonarCloud scan step
   - Set `SONAR_VERBOSE=true` for detailed logging

4. **Hardcoded Branch Name**

   - Attempted to hardcode branch name in environment variables
   - Set all branch-related variables to a specific value
   - Still resulted in NullPointerException

5. **Push Event Type**
   - Currently testing with a `push` event instead of `pull_request`
   - Simplified workflow configuration
   - Focused on essential steps and proper Node.js setup

## Remaining Solutions to Try

1. **Direct SonarScanner CLI**

   - Instead of using the GitHub Action, try running the SonarScanner CLI directly
   - This would bypass the GitHub Actions integration layer
   - Command would be: `sonar-scanner -Dsonar.branch.name=<branch>`

2. **Alternative Branch Detection**

   - Try using `git rev-parse --abbrev-ref HEAD` directly in the SonarCloud scan step
   - Set branch name using `SONAR_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)`

3. **SonarCloud GitHub Action Version**

   - Try downgrading to an older version of the SonarCloud GitHub Action
   - Some users reported success with version 1.x

4. **Manual Branch Configuration**

   - Remove `sonar.branch.autoconfig=true`
   - Set all branch-related properties manually in `sonar-project.properties`

5. **Act Configuration**
   - Try running `act` with additional environment variables
   - Use `act -s SONAR_TOKEN -e .github/env.json`

## Known Issues

1. **Act Limitations**

   - `act` doesn't fully simulate GitHub Actions environment
   - Some GitHub context variables might not be available
   - Branch information might not be properly passed

2. **SonarCloud Scanner Behavior**

   - Scanner expects certain GitHub Actions environment variables
   - Branch detection logic might be tightly coupled with GitHub Actions

3. **Version Compatibility**
   - Different versions of the SonarCloud scanner might handle branch information differently
   - GitHub Action version might affect branch detection

## References

1. [SonarCloud GitHub Action Issues](https://github.com/SonarSource/sonarcloud-github-action/issues)
2. [Act Documentation](https://github.com/nektos/act)
3. [SonarCloud Documentation](https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/)

## Next Steps

1. Test the workflow with a `push` event type
2. If successful, document the working configuration
3. If unsuccessful, try running SonarScanner CLI directly
4. Consider creating a separate workflow for local testing
5. Document successful configuration for future reference
