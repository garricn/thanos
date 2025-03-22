# Migration from Jest to Vitest for Script Tests

## Overview

This document details the migration of script tests from Jest to Vitest, a decision made to improve ESM (ECMAScript Modules) support in our testing infrastructure. The migration specifically targeted the script tests located in `scripts/__tests__/` while maintaining Jest for other parts of the codebase.

## Why Vitest?

### Technical Drivers

1. **Better ESM Support**: Our scripts use native ESM modules (`.js` files with `import`/`export`), which posed challenges with Jest's module mocking system. Vitest provides superior ESM support out of the box.
2. **Similar API**: Vitest maintains API compatibility with Jest, making the migration process smoother and reducing the learning curve for developers.
3. **Performance**: Vitest leverages Vite's dev server, offering faster test execution times.

### Migration Scope

The migration was intentionally limited to script tests to:

- Minimize risk by containing changes to a specific area
- Serve as a pilot for potential broader adoption
- Address immediate ESM-related testing challenges
- Maintain stability in the rest of the test suite

## Implementation Details

### Key Changes

1. **Configuration**:

   - Created a dedicated Vitest configuration at `scripts/configs/vitest.config.js`
   - Separated script test configuration from the main Jest setup

2. **Test Utilities**:

   - Updated test utilities to use Vitest's API
   - Simplified mock structures for improved test stability

3. **NPM Scripts**:
   - Modified `test:scripts` to use Vitest
   - Maintained separate test commands for different parts of the codebase

### Migration Pattern

The migration followed a file-by-file approach, converting:

1. Test utilities and helpers
2. Individual test files
3. Mock implementations
4. Assertions and expectations

### Key API Translations

| Jest                   | Vitest               |
| ---------------------- | -------------------- |
| `jest.mock()`          | `vi.mock()`          |
| `jest.spyOn()`         | `vi.spyOn()`         |
| `jest.clearAllMocks()` | `vi.clearAllMocks()` |

## Results and Benefits

### Improvements

1. **Reliable Module Mocking**: Better handling of ESM modules in tests
2. **Simplified Test Setup**: Cleaner configuration for script tests
3. **Improved Developer Experience**: More intuitive testing of ESM code
4. **Faster Test Execution**: Better performance for script tests

### Test Coverage

The migration maintained or improved test coverage while making the tests more reliable and easier to maintain.

## Future Considerations

1. **Potential Expansion**: Based on the success of this migration, we may consider expanding Vitest usage to other parts of the codebase.
2. **Maintenance**: The split testing setup (Jest + Vitest) requires maintaining two test configurations, which should be evaluated over time.
3. **Best Practices**: Continue to document and share learnings from using Vitest in our ecosystem.

## References

- [Vitest Documentation](https://vitest.dev/)
- [Jest to Vitest Migration Guide](https://vitest.dev/guide/migration.html)
