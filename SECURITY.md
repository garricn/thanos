# Security Policy

This document outlines the security procedures and policies for the Thanos project.

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to [security@example.com](mailto:security@example.com). All security vulnerabilities will be promptly addressed.

## Security Measures

### Dependency Vulnerability Management

This project uses several approaches to manage security vulnerabilities in dependencies:

#### 1. Snyk Integration

We use Snyk for security vulnerability scanning. The project is configured to:

- Run Snyk security audit in CI if SNYK_TOKEN is configured
- Fall back to npm audit if SNYK_TOKEN is not available
- Block PRs if high or critical vulnerabilities are found

#### 2. npm-force-resolutions

The project uses [npm-force-resolutions](https://www.npmjs.com/package/npm-force-resolutions) to handle transitive dependency vulnerabilities that cannot be directly resolved through normal dependency updates.

**How it works:**

1. The `preinstall` script in package.json runs npm-force-resolutions
2. The tool reads the `resolutions` field in package.json
3. It forces specific versions of transitive dependencies to be used, overriding what would normally be installed

**Why we use it:**

- Some vulnerabilities exist in dependencies of our dependencies (transitive dependencies)
- In these cases, we often cannot directly upgrade the vulnerable package
- npm-force-resolutions allows us to specify exact versions to use, even for transitive dependencies

#### 3. Snyk Policy File (.snyk)

For cases where vulnerabilities cannot be resolved through updates or force-resolutions, we use a Snyk policy file (.snyk) to:

- Document known vulnerabilities that we've assessed
- Specify expiration dates for vulnerability exceptions
- Provide reasoning for why exceptions are necessary

### Example: Inflight Package Vulnerability

A specific example of our vulnerability management approach is how we handle the vulnerability in the `inflight` package:

1. **Vulnerability Details:**

   - Vulnerability ID: SNYK-JS-INFLIGHT-6095116
   - The `inflight` package is a transitive dependency used by multiple packages in our dependency tree

2. **Management Approach:**

   - We specify a fixed version (1.0.6) in the `resolutions` field of package.json
   - npm-force-resolutions ensures this specific version is used throughout the dependency tree
   - We've added a Snyk policy exception in the .snyk file with documentation about why this approach was necessary

3. **Documentation:**
   - The commit history includes detailed information about when and why this approach was implemented
   - The .snyk file documents the reasoning: "Inflight is a transitive dependency with no direct upgrade path available"

## Security Best Practices

### Running Security Checks

To run security checks locally:

```bash
# Run security check
npm run security:check

# Fix security issues (interactive)
npm run security:fix
```

### Keeping Dependencies Updated

We regularly update dependencies to incorporate security fixes:

```bash
# Update dependencies and fix vulnerabilities
npm run update:deps

# For cases requiring breaking changes
npm run update:deps:force
```

## Security Reports

Security reports are generated as part of our CI/CD process and are available as artifacts in GitHub Actions workflow runs.
