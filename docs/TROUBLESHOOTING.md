# Troubleshooting Guide

This guide addresses common issues you might encounter when working with the Thanos project and provides solutions.

## E2E Testing Issues

### E2E Tests Fail

**Issue**: If E2E tests fail, ensure that both web and API servers are running on the expected ports.

**Solution**: Run the servers in separate terminals before running E2E tests manually.

```bash
# In one terminal, start the web server
npm run start:web

# In another terminal, start the API server
npm run start:api

# In a third terminal, run the E2E tests
npm run test:e2e
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

## Path Reference Issues

### Original Thanos Project References in Error Messages

**Issue**: Path references to the original Thanos project in error messages.

**Solution**: The generator script attempts to replace all absolute paths, but if you encounter any remaining references:

1. Check the specific files mentioned in the error messages
2. Update the paths manually to match your project name
3. Run a global search in your codebase for "thanos" to find any other occurrences

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
   npm run dev --workspace=apps/web -- --port=4201

   # Start API server on a different port
   PORT=3001 npm run dev --workspace=apps/api
   ```

## Getting Additional Help

If you encounter issues not covered in this troubleshooting guide:

1. Check the project documentation in the docs/ directory
2. Search for your issue in the project's GitHub issues
3. Create a new issue if your problem hasn't been addressed

npm config set legacy-peer-deps true
