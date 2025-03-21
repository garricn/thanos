import { jest } from '@jest/globals';
import { runPreCommitChecks, runPrePushChecks } from '../git-hooks.js';

describe('git-hooks', () => {
  let mockExecSync;

  beforeEach(() => {
    // Create a new mock function for each test
    mockExecSync = jest.fn();
  });

  describe('runPreCommitChecks', () => {
    it('should run lint-staged with correct config', async () => {
      // Set up mock to return different values for different calls
      mockExecSync.mockImplementation((cmd, opts) => {
        if (
          cmd ===
          'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$'
        ) {
          return ''; // No TypeScript files
        }
        return ''; // Default empty return
      });

      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
    });

    it('should type check staged TypeScript files', async () => {
      // Set up mock to return TS files for the git diff command
      mockExecSync.mockImplementation((cmd, opts) => {
        if (
          cmd ===
          'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$'
        ) {
          return 'file1.ts file2.tsx'; // Return some TS files without newline
        }
        return ''; // Default empty return
      });

      await runPreCommitChecks(mockExecSync);

      // Check that lint-staged was called
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );

      // Check that git diff was called
      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$',
        expect.any(Object)
      );

      // Check that tsc was called with the right files
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx tsc --noEmit file1.ts file2.tsx',
        expect.any(Object)
      );
    });

    it('should skip type checking if no TypeScript files are staged', async () => {
      // Set up mock to return no TS files for the git diff command
      mockExecSync.mockImplementation((cmd, opts) => {
        if (
          cmd ===
          'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$'
        ) {
          return ''; // No TypeScript files
        }
        return ''; // Default empty return
      });

      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledTimes(2); // Only lint-staged and git diff

      // Verify it was the right commands
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$',
        expect.any(Object)
      );
    });
  });

  describe('runPrePushChecks', () => {
    it('should run all required checks in order', async () => {
      await runPrePushChecks(mockExecSync);

      const calls = mockExecSync.mock.calls.map((call) => call[0]);
      expect(calls).toEqual([
        'npm run node:version',
        'npm run type-check',
        'npm run lint',
        'npm run test:unit',
      ]);
    });

    it('should throw if any check fails', async () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('Node version check failed');
      });

      await expect(runPrePushChecks(mockExecSync)).rejects.toThrow(
        'Node version check failed'
      );
      expect(mockExecSync).toHaveBeenCalledTimes(1); // Should stop after first failure
    });
  });
});
