# Testing ES Modules in Jest

This directory contains tests for JavaScript modules using ESM (ECMAScript Modules) syntax. Here are some key approaches and lessons learned when testing ESM modules with Jest.

## Approaches for Testing ESM Modules

### 1. Direct Testing (Recommended)

The most reliable approach is direct testing, where we create our own implementation of the functions being tested and inject mocks directly as parameters. This approach is demonstrated in `test-e2e-direct.test.js`.

Key benefits:

- Reliable mocking without module loader issues
- Complete control over dependencies
- Easier to understand and debug
- Works with any module system

Example:

```javascript
// Original function
export function execCmd(command, options = {}) {
  console.log(`Executing: ${command}`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      ...options,
    });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    throw error;
  }
}

// Test implementation with injectable dependencies
function execCmd(command, options = {}, execSyncFn, consoleFns = console) {
  consoleFns.log(`Executing: ${command}`);
  try {
    return execSyncFn(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      ...options,
    });
  } catch (error) {
    consoleFns.error(`Command failed: ${command}`);
    throw error;
  }
}

// Test
it('should execute command successfully', () => {
  const mockExecSync = jest.fn().mockReturnValue('output');
  const mockConsole = { log: jest.fn(), error: jest.fn() };

  const result = execCmd('test', {}, mockExecSync, mockConsole);

  expect(mockExecSync).toHaveBeenCalledWith(
    'test',
    expect.objectContaining({
      stdio: 'inherit',
    })
  );
  expect(result).toBe('output');
});
```

### 2. Module Mocking with Jest

When direct testing isn't feasible, we can use Jest's module mocking system. However, this can be tricky with ESM:

```javascript
// Mock modules directly
jest.mock('child_process', () => ({
  execSync: mockExecSync,
  spawn: mockSpawn,
  exec: mockExec,
}));

// Mock wait-on as a direct function
jest.mock('wait-on', () => mockWaitOn);

// Import the module after all mocks are set up
import { execCmd } from '../bin/test-e2e.js';
```

Challenges with this approach:

- Mock hoisting doesn't always work as expected with ESM
- Mocks may not be applied properly when importing the module under test
- Different behavior between CommonJS and ESM modules

### 3. Dynamic Import Mocking

Using `jest.unstable_mockModule` and dynamic imports:

```javascript
jest.unstable_mockModule('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
}));

const childProcess = await import('child_process');
const mockExecSync = childProcess.execSync;

// Import the module under test AFTER mocks are set up
const testModule = await import('../bin/test-e2e.js');
```

This approach is more reliable with ESM but still has issues with modules that access globals or have side effects at import time.

## Best Practices

1. **Prefer direct testing** where dependencies are injected as parameters
2. **Keep module imports at the top** for clarity, but ensure mocks are defined before imports
3. **Reset mocks between tests** using `beforeEach` to ensure clean test state
4. **Test the smallest units possible** to minimize mocking complexity
5. **Use explicit error handling** in tests to avoid unexpected test failures
6. **Mock timers appropriately** using `jest.useFakeTimers()` and `jest.advanceTimersByTime()`

## Known Issues

- Jest's module mocking system works differently between ESM and CommonJS
- Some modules may be loaded before mocks are applied, especially in ESM context
- Real network/system calls may occur if mocking is not properly applied

## Further Improvements

To enhance the testability of modules, consider:

1. Refactoring functions to accept dependencies as parameters
2. Creating factory functions that return configured instances
3. Using dependency injection patterns to simplify testing
4. Separating side effects from pure logic for easier testing

## References

- [Jest Documentation for ESM Support](https://jestjs.io/docs/ecmascript-modules)
- [Testing Node.js Applications](https://nodejs.org/en/docs/guides/testing-node-js-applications/)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
