# CI Workflow Comparison

This document compares different CI workflows available in the project.

## Available CI Workflows

1. Local CI (`npm run local-ci`)
2. GitHub Actions (cloud CI)

## Comparison

| Feature                | Local CI              | GitHub Actions          |
| ---------------------- | --------------------- | ----------------------- |
| Command                | `npm run local-ci`    | Automatic on push/PR    |
| Environment            | Local machine         | GitHub servers          |
| Setup Requirements     | Node.js, dependencies | None (for usage)        |
| Speed                  | Fast                  | Varies with queue       |
| Resource Usage         | Local resources       | Cloud resources         |
| Cost                   | Free                  | Free for public repos   |
| Configuration Required | Minimal               | GitHub Actions workflow |

## Local CI

The local CI runs all checks on your local machine.

### Local CI Command

```bash
npm run local-ci
```

### Local CI Advantages

- Fast execution (no waiting for cloud resources)
- Works offline
- Immediate feedback
- No cloud resource limits

### Local CI Disadvantages

- Uses local system resources
- Needs local development setup
- May have environment differences

### Local CI Use Cases

- Quick validation before committing
- Development iterations
- Offline development

## GitHub Actions

GitHub Actions runs checks in the cloud on every push and pull request.

### GitHub Actions Advantages

- Consistent environment
- No local resource usage
- Automated on every push
- Parallel job execution
- Integration with GitHub

### GitHub Actions Disadvantages

- Depends on GitHub availability
- Queue times possible
- Limited minutes for private repos
- Internet connection required

### GitHub Actions Use Cases

- Final validation before merge
- Pull request checks
- Release processes
- Automated deployments

## Recommended Workflow

For the most efficient development process:

1. Use **Local CI** during development for quick feedback
2. Let **GitHub Actions** validate all changes automatically

## Best Practices

1. Always run local CI before pushing
2. Monitor GitHub Actions results
3. Keep CI configurations in sync
4. Maintain test coverage
5. Regular dependency updates
