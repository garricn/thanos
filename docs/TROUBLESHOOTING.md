# Troubleshooting Guide

This guide addresses common issues you might encounter when working with the Thanos project and provides solutions.

## E2E Testing Issues

### E2E Tests Failing

**Issue**: If `nx e2e` fails, ensure `nx serve` is running on port 4200.

**Solution**: Run `nx serve web` in a separate terminal before running e2e tests.

```bash
# Terminal 1: Start the web server
nx serve web

# Terminal 2: Run the E2E tests
nx e2e web-e2e
```

### Component Tests Failing with Style-Related Errors

**Issue**: Component tests failing with style-related errors.

**Solution**: Make sure Tailwind CSS is properly configured and imported. Check that:

1. Tailwind config is properly set up in `tailwind.config.js`
2. Styles are imported in your test setup files
3. Component style imports are correct

## Dependency Issues

### Dependency Conflicts During Installation

**Issue**: Dependency conflicts during `npm install` with errors about Cypress versions.

**Solution**: Use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

This is automatically configured in the generated project via the `.npmrc` file.

## NX Daemon Issues

### NX Daemon Errors

**Issue**: Nx daemon errors when running commands in a generated project.

**Solution**: Try the following options:

**Option 1**: Run without the daemon (recommended)

```bash
# Use the no-daemon script
npm run start:no-daemon
```

**Option 2**: Reset the daemon

```bash
# 1. Reset the NX cache
npx nx reset

# 2. If that doesn't work, kill any running NX processes
pkill -f "nx"

# 3. Remove socket files that might be causing conflicts
find /var/folders -name "d.sock" -delete

# 4. Reset NX again
npx nx reset
```

## Path Reference Issues

### Original Thanos Project References in Error Messages

**Issue**: Path references to the original Thanos project in error messages.

**Solution**: The generator script attempts to replace all absolute paths, but if you encounter any remaining references:

1. Check the specific files mentioned in the error messages
2. Update the paths manually to match your project name
3. Run a global search in your codebase for "thanos" to find any other occurrences

## Git Issues

### Git Shows Changes in .nx Directory

**Issue**: Git shows changes in .nx directory files after running commands.

**Solution**: The .nx directory should be gitignored in generated projects. If you see these files in git status:

```bash
# Remove .nx directory from git tracking
git rm -r --cached .nx

# Ensure .nx is in your .gitignore file
echo ".nx/" >> .gitignore

# Commit the changes
git commit -m "Remove .nx directory from git tracking"
```

## Port Conflicts

### Services Won't Start Due to Port Conflicts

**Issue**: Web server or API server won't start because the port is already in use.

**Solution**:

1. Find and kill processes using the conflicting ports:

   ```bash
   # For port 4200 (web server)
   lsof -i :4200
   kill -9 <PID>

   # For port 3000 (API server)
   lsof -i :3000
   kill -9 <PID>
   ```

2. Alternatively, configure the services to use different ports:

   ```bash
   # Start web server on a different port
   nx serve web --port=4201

   # Start API server on a different port
   nx serve api --port=3001
   ```

## Getting Additional Help

If you encounter issues not covered in this troubleshooting guide:

1. Check the [Nx documentation](https://nx.dev/getting-started/intro)
2. Search for your issue in the project's GitHub issues
3. Create a new issue if your problem hasn't been addressed
