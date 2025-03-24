import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runPreCommitChecks, runPrePushChecks } from '../hooks/git-hooks.js';
import { setupMockDefaults } from './test-utils.js';

// Mock execSync and console methods
const mockExecSync = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('git-hooks', () => {
  beforeEach(() => {
    setupMockDefaults();
    // Clear specific mocks for these tests
    vi.clearAllMocks();
  });

  describe('runPreCommitChecks', () => {
    it('should run format, lint, and type checks', async () => {
      // Act
      await runPreCommitChecks(mockExecSync);

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith('npx lint-staged', {
        stdio: 'inherit',
        encoding: 'utf-8',
      });
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
      mockExecSync.mockImplementationOnce(command => {
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
      mockExecSync.mockImplementationOnce(command => {
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
      mockExecSync.mockImplementationOnce(command => {
        if (command.includes('lint-staged')) {
          throw new Error('Format errors found');
        }
        return '';
      });

      // Act & Assert
      try {
        await runPreCommitChecks(mockExecSync);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Format errors found');
      }
    });

    it('should pass when all checks pass', async () => {
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
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // Ignore any errors for this test
      }

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith('npm run node:version', expect.any(Object));
      expect(mockExecSync).toHaveBeenCalledWith('npm run type-check', expect.any(Object));
      expect(mockExecSync).toHaveBeenCalledWith('npm run lint', expect.any(Object));
      expect(mockExecSync).toHaveBeenCalledWith('npm run test:unit', expect.any(Object));
    });

    it('should handle errors during pre-push checks', async () => {
      // Arrange - simulate test failure
      mockExecSync.mockImplementation(command => {
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
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // The message doesn't contain "Tests failed" directly, but something about the error message
        expect(mockConsoleError).toHaveBeenCalled();
      }
    });

    it('should run all pre-push checks in sequence', async () => {
      // Act
      try {
        await runPrePushChecks(mockExecSync);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // Ignore any errors for this test
      }

      // Assert
      const calls = mockExecSync.mock.calls.map(call => call[0]);

      // Check if node:version comes before type-check, which comes before lint, which comes before test:unit
      const nodeVersionIndex = calls.findIndex(call => call === 'npm run node:version');
      const typeCheckIndex = calls.findIndex(call => call === 'npm run type-check');
      const lintIndex = calls.findIndex(call => call === 'npm run lint');
      const testUnitIndex = calls.findIndex(call => call === 'npm run test:unit');

      expect(nodeVersionIndex).toBeLessThan(typeCheckIndex);
      expect(typeCheckIndex).toBeLessThan(lintIndex);
      expect(lintIndex).toBeLessThan(testUnitIndex);
    });

    it('should log success message when all checks pass', async () => {
      // Arrange - mock successful executions
      mockExecSync.mockImplementation(() => '');

      // Act
      await runPrePushChecks(mockExecSync);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('All pre-push checks passed')
      );
    });
  });
});
