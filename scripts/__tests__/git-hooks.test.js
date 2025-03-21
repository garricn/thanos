import { jest } from '@jest/globals';
import {
  setupCommonMocks,
  setupTestEnvironment,
  createGitState,
  expectSuccessMessage,
  expectErrorMessage,
} from './test-utils.js';
import { runPreCommitChecks, runPrePushChecks } from '../hooks/git-hooks.js';

// Set up common mocks
const { mockExecSync } = setupCommonMocks();

// Set up test environment
const { mockExit, mockConsoleLog, mockConsoleError } = setupTestEnvironment();

describe('git-hooks', () => {
  beforeEach(() => {
    mockExecSync.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe('runPreCommitChecks', () => {
    it('should run lint-staged with correct config', async () => {
      const state = createGitState();
      setupMockExecForState(state);

      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
    });

    it('should type check staged TypeScript files', async () => {
      const state = createGitState({
        stagedFiles: ['file.ts'],
        hasTypeScriptFiles: true,
      });
      setupMockExecForState(state);

      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$',
        expect.any(Object)
      );

      expect(mockExecSync).toHaveBeenCalledWith(
        'npx tsc --noEmit file.ts',
        expect.any(Object)
      );
    });

    it('should skip type checking if no TypeScript files are staged', async () => {
      const state = createGitState({
        hasTypeScriptFiles: false,
      });
      setupMockExecForState(state);

      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledTimes(3);
      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
    });

    it('should handle grep returning non-zero when no TypeScript files are found', async () => {
      const state = createGitState({
        hasTypeScriptFiles: false,
      });
      setupMockExecForState(state);

      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
    });

    it('should handle errors during pre-commit checks', async () => {
      const state = createGitState({
        lintPass: false,
      });
      setupMockExecForState(state);

      await expect(runPreCommitChecks(mockExecSync)).rejects.toThrow(
        'Lint check failed'
      );
    });

    it('should pass when there are no linting or type errors', async () => {
      const state = createGitState();
      setupMockExecForState(state);

      await expect(runPreCommitChecks(mockExecSync)).resolves.not.toThrow();
    });

    it('should fail when there are linting errors', async () => {
      const state = createGitState({
        lintPass: false,
      });
      setupMockExecForState(state);

      await expect(runPreCommitChecks(mockExecSync)).rejects.toThrow(
        'Lint check failed'
      );
    });

    it('should fail when there are type errors', async () => {
      const state = createGitState({
        typePass: false,
      });
      setupMockExecForState(state);

      await expect(runPreCommitChecks(mockExecSync)).rejects.toThrow(
        'Type check failed'
      );
    });
  });

  describe('runPrePushChecks', () => {
    it('should run all required checks in order', async () => {
      const state = createGitState();
      setupMockExecForState(state);

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
      const state = createGitState({
        typePass: false,
      });
      setupMockExecForState(state);

      await expect(runPrePushChecks(mockExecSync)).rejects.toThrow(
        'Type check failed'
      );
      expect(mockExecSync).toHaveBeenCalledTimes(2); // node:version and type-check
    });

    it('should run all pre-push checks in sequence', async () => {
      const state = createGitState();
      setupMockExecForState(state);

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

    it('should pass when all checks pass', async () => {
      const state = createGitState();
      setupMockExecForState(state);

      await expect(runPrePushChecks(mockExecSync)).resolves.not.toThrow();
    });

    it('should fail when tests fail', async () => {
      const state = createGitState({
        testPass: false,
      });
      setupMockExecForState(state);

      await expect(runPrePushChecks(mockExecSync)).rejects.toThrow(
        'Test check failed'
      );
    });

    it('should fail when Node version is incorrect', async () => {
      const state = createGitState();
      mockExecSync.mockImplementation((command) => {
        if (command === 'npm run node:version') {
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

// Helper function to set up mock exec based on state
function setupMockExecForState(state) {
  mockExecSync.mockImplementation((command, options = {}) => {
    if (command.includes('git diff --cached --name-only')) {
      if (command.includes('grep .ts$')) {
        if (!state.hasTypeScriptFiles) {
          throw new Error('grep: no matches found');
        }
        return state.stagedFiles?.join('\n') || 'file.ts\n';
      }
      return state.stagedFiles?.join('\n') || 'file.ts\n';
    }
    if (command.includes('npm run lint') || command.includes('lint-staged')) {
      if (!state.lintPass) {
        throw new Error('Lint check failed');
      }
      return '';
    }
    if (
      command.includes('npm run type-check') ||
      command.includes('tsc --noEmit')
    ) {
      if (!state.typePass) {
        throw new Error('Type check failed');
      }
      return '';
    }
    if (command.includes('npm run test:unit')) {
      if (!state.testPass) {
        throw new Error('Test check failed');
      }
      return '';
    }
    return '';
  });
}
