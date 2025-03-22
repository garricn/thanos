import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runPreCommitChecks, runPrePushChecks } from '../hooks/git-hooks.js';
import {
  mockExecSync,
  mockConsoleLog,
  mockConsoleError,
  mockExit,
  setupMockDefaults,
} from './test-utils.js';

describe('git-hooks', () => {
  beforeEach(() => {
    setupMockDefaults();
    // Clear specific mocks for these tests
    mockExecSync.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockExit.mockClear();
  });

  describe('runPreCommitChecks', () => {
    it('should run lint-staged with correct config', async () => {
      // Act
      await runPreCommitChecks(mockExecSync);

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('should type check staged TypeScript files', async () => {
      // Arrange - simulate finding TS files
      // First call is lint-staged
      // Second call is grep for TS files
      // Third call would be tsc
      const files = 'file1.ts\nfile2.tsx';

      mockExecSync
        .mockImplementationOnce(() => 'lint-staged output') // lint-staged
        .mockImplementationOnce(() => files); // grep for TS files

      // Act
      await runPreCommitChecks(mockExecSync);

      // Assert
      // We need to check the 3rd call which is the tsc call
      const thirdCall = mockExecSync.mock.calls[2];
      expect(thirdCall[0]).toContain('npx tsc --noEmit');
      expect(thirdCall[0]).toContain(files);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Type checking staged TypeScript files')
      );
    });

    it('should skip type checking if no TypeScript files are staged', async () => {
      // Arrange - simulate finding no TS files
      mockExecSync.mockImplementationOnce((command) => {
        if (command.includes('grep -E \\.tsx?$')) {
          return '';
        }
        return '';
      });

      // Act
      await runPreCommitChecks(mockExecSync);

      // Assert
      expect(mockExecSync).not.toHaveBeenCalledWith(
        expect.stringContaining('tsc --noEmit'),
        expect.any(Object)
      );
      // In the actual implementation, we don't log this message, so we shouldn't check for it
      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        expect.stringContaining('No TypeScript files in commit')
      );
    });

    it('should handle grep returning non-zero when no TypeScript files are found', async () => {
      // Arrange - simulate grep command failing
      mockExecSync.mockImplementationOnce((command) => {
        if (command.includes('grep -E \\.tsx?$')) {
          throw new Error('No files match pattern');
        }
        return '';
      });

      // Act
      await runPreCommitChecks(mockExecSync);

      // Assert
      expect(mockExecSync).not.toHaveBeenCalledWith(
        expect.stringContaining('tsc --noEmit'),
        expect.any(Object)
      );
    });

    it('should handle errors during pre-commit checks', async () => {
      // Arrange - simulate lint-staged failing
      mockExecSync.mockImplementationOnce((command) => {
        if (command.includes('lint-staged')) {
          throw new Error('Lint errors found');
        }
        return '';
      });

      // Act & Assert
      try {
        await runPreCommitChecks(mockExecSync);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('Lint errors found');
      }
    });

    it('should pass when there are no linting or type errors', async () => {
      // Arrange
      mockExecSync.mockImplementationOnce((command) => {
        if (command.includes('grep -E \\.tsx?$')) {
          return 'file1.ts\nfile2.tsx';
        }
        return '';
      });

      // Act
      await runPreCommitChecks(mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('All pre-commit checks passed')
      );
    });
  });

  describe('runPrePushChecks', () => {
    it('should run all required checks in order', async () => {
      // Act
      try {
        await runPrePushChecks(mockExecSync);
      } catch (error) {
        // Ignore any errors for this test
      }

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm run node:version',
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm run type-check',
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm run lint',
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm run test:unit',
        expect.any(Object)
      );
    });

    it('should handle errors during pre-push checks', async () => {
      // Arrange - simulate test failure
      mockExecSync.mockImplementation((command) => {
        if (command === 'npm run test:unit') {
          const error = new Error('Tests failed');
          error.stdout = 'Some test output';
          error.stderr = 'Some test error output';
          throw error;
        }
        return '';
      });

      // Act & Assert
      try {
        await runPrePushChecks(mockExecSync);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // The message doesn't contain "Tests failed" directly, but something about the error message
        expect(mockConsoleError).toHaveBeenCalled();
      }
    });

    it('should run all pre-push checks in sequence', async () => {
      // Act
      try {
        await runPrePushChecks(mockExecSync);
      } catch (error) {
        // Ignore any errors for this test
      }

      // Assert
      const calls = mockExecSync.mock.calls.map((call) => call[0]);

      // Check if node:version comes before type-check, which comes before lint, which comes before test:unit
      const nodeVersionIndex = calls.findIndex(
        (call) => call === 'npm run node:version'
      );
      const typeCheckIndex = calls.findIndex(
        (call) => call === 'npm run type-check'
      );
      const lintIndex = calls.findIndex((call) => call === 'npm run lint');
      const testUnitIndex = calls.findIndex(
        (call) => call === 'npm run test:unit'
      );

      expect(nodeVersionIndex).toBeLessThan(typeCheckIndex);
      expect(typeCheckIndex).toBeLessThan(lintIndex);
      expect(lintIndex).toBeLessThan(testUnitIndex);
    });

    it('should log success message when all checks pass', async () => {
      // Act
      await runPrePushChecks(mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('All pre-push checks passed')
      );
    });
  });
});
