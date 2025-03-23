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
