# Testing Pattern

This document describes the established pattern for adding new tests to the project.

## Test-Driven Development Pattern for Adding New Tests

### 1. Run existing tests to establish baseline

```bash
npm run test:scripts -- scripts/__tests__/shell-utils.test.js
```

- Verify all tests pass before proceeding

### 2. Add one behavioral test at a time

- Add exactly ONE `it` test function at a time
- Write test following Arrange/Act/Assert pattern
- Focus on testing actual behavior, not implementation details
- Use descriptive test names that explain the scenario
- Follow project's single-quote style
- If you need multiple test cases, run through the entire pattern for each `it` block

### 3. Run tests again to verify new test

```bash
npm run test:scripts -- scripts/__tests__/shell-utils.test.js
```

- Fix any failing tests before proceeding
- Only proceed to next test after current test passes

### 4. Run formatter and linter

```bash
npm run format && npm run lint
```

- Ensure code style compliance
- Fix any formatting/linting issues

### 5. Commit changes

```bash
git add <file> && git commit -m "test: <descriptive message>"
```

- Use conventional commit format (e.g., "test: add behavioral test for X")
- Let pre-commit hooks verify everything
- Commit after each new test is added

## Key Principles

- Add only one `it` test at a time
- Focus on behavioral tests that verify functionality
- Maintain consistent code style
- Ensure all checks pass before committing
- Complete the entire pattern before starting the next test

## Example

Here's an example of adding a new behavioral test:

```javascript
describe('getCurrentNodeVersion', () => {
  it('returns the current Node.js version', () => {
    // Arrange
    mockExecSync.mockImplementation(command => {
      if (command === 'node -v') {
        return 'v18.15.0';
      }
      return '';
    });

    // Act
    const version = getCurrentNodeVersion(mockExecSync);

    // Assert
    expect(version).toBe('18');
    expect(mockExecSync).toHaveBeenCalledWith('node -v', expect.any(Object));
  });
});
```

After this test is added, run through steps 3-5 before adding another test, even if it's in the same `describe` block.

This pattern ensures we maintain code quality and test coverage while making incremental improvements to the test suite.

Use dependency injection and direct mocking just like the other test files.

## Dependency Injection Pattern

When writing tests, follow these principles for dependency injection:

1. **Inject Dependencies**

   ```typescript
   // Instead of creating dependencies inside functions
   function createServer() {
     const app = express(); // ❌ Don't do this
     app.listen(3000);
   }

   // Inject them as parameters
   function createServer(app: Express) { // ✅ Do this
     app.listen(3000);
   }
   ```

2. **Make Dependencies Required**
   - Make core dependencies required parameters
   - Use optional parameters for configuration
   - This makes the dependencies explicit and testable

3. **Test Both DI and Behavior**

   ```typescript
   describe('createServer', () => {
     it('uses the provided app dependency', () => {
       // Arrange
       const mockApp = {
         listen: vi.fn().mockReturnValue({ port: 3000, close: vi.fn() })
       };

       // Act
       createServer(mockApp);

       // Assert
       expect(mockApp.listen).toHaveBeenCalledWith(3000);
     });
   });
   ```

## Type Safety in TDD

1. **Enable Type Checking**
   - Use `pretest` hook in package.json to run type checking before tests

   ```json
   {
     "scripts": {
       "pretest": "tsc --noEmit --project ./tsconfig.json",
       "test": "vitest"
     }
   }
   ```

2. **Fix Type Errors First**
   - Address type errors before running tests
   - Type errors indicate potential runtime issues
   - Use TypeScript's type system to catch errors early

## Test Structure

1. **Separate Unit and E2E Tests**
   - Unit tests: Test individual functions with mocked dependencies
   - E2E tests: Test the full system with real dependencies
   - Keep test files in appropriate directories (e.g., `tests/` vs `e2e/`)

2. **Mock Dependencies Effectively**

   ```typescript
   // Create focused mocks that only implement what's needed
   const mockApp = {
     listen: vi.fn(),
     // Don't mock unnecessary methods
   };
   ```

3. **Test One Behavior at a Time**
   - Each test should verify one specific behavior
   - Use descriptive test names that explain the scenario
   - Keep tests focused and maintainable
