import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runPreCommitChecks } from '../hooks/git-hooks.js';
import { mockExit } from './test-utils.js';

// Mock the git-hooks.js module
vi.mock('../hooks/git-hooks.js', () => ({
  runPreCommitChecks: vi.fn(),
}));

// Mock process.exit
vi.mock('process', () => ({
  exit: mockExit,
}));

describe('pre-commit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call runPreCommitChecks and exit with code 0 on success', async () => {
    // Arrange
    const promise = Promise.resolve();
    runPreCommitChecks.mockReturnValueOnce(promise);

    // Act
    await import('../hooks/pre-commit.js');

    // Assert
    expect(runPreCommitChecks).toHaveBeenCalledTimes(1);

    // Wait for promise to resolve
    await promise;
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should call runPreCommitChecks and exit with code 1 on failure', async () => {
    // Arrange
    vi.resetModules(); // Reset module registry to allow re-importing

    // Mock runPreCommitChecks to return a rejecting promise
    runPreCommitChecks.mockImplementationOnce(() => {
      return Promise.reject(new Error('Pre-commit check failed'));
    });

    // Act
    // We need to catch the unhandled rejection that will happen in pre-commit.js
    // This is normal behavior in the test since we're testing error handling
    const unhandledRejection = event => {
      event.preventDefault();
    };

    process.on('unhandledRejection', unhandledRejection);

    try {
      await import('../hooks/pre-commit.js');

      // Allow time for the promise rejection to be processed
      await vi.waitFor(() => {
        return mockExit.mock.calls.some(call => call[0] === 1);
      });

      // Assert
      expect(runPreCommitChecks).toHaveBeenCalledTimes(1);
      expect(mockExit).toHaveBeenCalledWith(1);
    } finally {
      // Clean up the event listener
      process.off('unhandledRejection', unhandledRejection);
    }
  });
});
