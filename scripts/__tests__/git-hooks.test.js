import { jest } from '@jest/globals';
import { runPreCommitChecks, runPrePushChecks } from '../hooks/git-hooks.js';

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

    it('should handle grep returning non-zero when no TypeScript files are found', async () => {
      mockExecSync.mockImplementation((cmd, opts) => {
        if (
          cmd ===
          'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$'
        ) {
          throw new Error('grep: no matches found'); // Simulate grep returning non-zero
        }
        return ''; // Default empty return
      });

      await runPreCommitChecks(mockExecSync);

      // Should still run lint-staged even if no TS files are found
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
    });

    it('should handle errors during pre-commit checks', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (
          cmd === 'npx lint-staged --config configs/lint/.lintstagedrc.json'
        ) {
          throw new Error('Lint failed');
        }
        return '';
      });

      await expect(runPreCommitChecks(mockExecSync)).rejects.toThrow(
        'Lint failed'
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

    it('should run all pre-push checks in sequence', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'npm run node:version') return 'v18.17.0';
        if (cmd === 'npm run type-check') return '';
        if (cmd === 'npm run lint') return '';
        if (cmd === 'npm run test:unit') return '';
        return '';
      });

      await runPrePushChecks(mockExecSync);

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
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === 'npm run node:version') {
          throw new Error('Node version check failed');
        }
        return '';
      });

      await expect(runPrePushChecks(mockExecSync)).rejects.toThrow(
        'Node version check failed'
      );
    });
  });
});
