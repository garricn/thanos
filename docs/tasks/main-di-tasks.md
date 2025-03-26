# Main.ts Dependency Injection Tasks

This task list follows the testing patterns described in [TESTING_PATTERN.md](../TESTING_PATTERN.md).

## Current State

- We've injected the Express app dependency into `createServer`
- We've updated tests to verify the app dependency injection
- We've updated e2e tests to work with the new DI pattern

## Remaining Tasks

### 1. Logger Dependency

- [ ] Create a Logger interface in `main.ts`

  ```typescript
  interface Logger {
    info(message: string): void;
    error(message: string): void;
  }
  ```

- [ ] Inject logger into `createServer`
- [ ] Update tests to verify logger usage
- [ ] Update e2e tests to provide a real logger

### 2. Server Configuration

- [ ] Create a proper ServerConfig interface

  ```typescript
  interface ServerConfig {
    port: number;
    host?: string;
    // Add other server configuration options as needed
  }
  ```

- [ ] Make ServerConfig a required parameter
- [ ] Update tests to verify server configuration
- [ ] Update e2e tests to use proper configuration

### 3. Error Handling

- [ ] Add proper error handling for server startup
- [ ] Use injected logger for error reporting
- [ ] Add tests for error scenarios
- [ ] Add graceful shutdown handling

### 4. Testing Improvements

- [ ] Add more comprehensive unit tests
  - Test server startup with different configurations
  - Test error handling scenarios
  - Test graceful shutdown
- [ ] Add integration tests
  - Test server with real Express app
  - Test with real logger
  - Test with different configurations

### 5. Documentation

- [ ] Add JSDoc comments for all interfaces and functions
- [ ] Update API documentation
- [ ] Add examples in comments
- [ ] Document error handling patterns

## Implementation Order

1. Logger Dependency (highest priority)
2. Server Configuration
3. Error Handling
4. Testing Improvements
5. Documentation

## Success Criteria

- All dependencies are properly injected
- All tests pass
- Code is properly documented
- Error handling is robust
- Configuration is flexible but type-safe
- No direct dependencies on external services in main.ts

## Notes

- Follow TDD approach for each task
- Update tests first, then implement
- Keep changes small and focused
- Maintain backward compatibility where possible
- Document breaking changes
