import { jest } from '@jest/globals';
import { runPreCommitChecks, runPrePushChecks } from '../hooks/git-hooks.js';

// Mock child_process.execSync
const mockExecSync = jest.fn();
jest.mock('child_process', () => ({
  execSync: mockExecSync,
}));

// Higher-level mocks for different states
const mockGitState = {
  hasStagedChanges: true,
  hasTypeScriptFiles: true,
  hasLintingErrors: false,
  hasTypeErrors: false,
};

const mockNpmState = {
  nodeVersion: 'v18.17.0',
  testsPass: true,
  lintPass: true,
  typePass: true,
};

// Helper to set up mock state
const setupMockState = (gitState = mockGitState, npmState = mockNpmState) => {
  mockExecSync.mockImplementation((command, options = {}) => {
    if (command.includes('git diff --cached --name-only')) {
      if (!gitState.hasStagedChanges) {
        return '';
      }
      if (command.includes('grep .ts$')) {
        if (!gitState.hasTypeScriptFiles) {
          throw new Error('grep: no matches found');
        }
        return 'file.ts\n';
      }
      return 'file.ts\n';
    }
    if (command.includes('npm run lint')) {
      if (!npmState.lintPass) {
        throw new Error('Lint check failed');
      }
      return '';
    }
    if (command.includes('npm run type-check')) {
      if (!npmState.typePass) {
        throw new Error('Type check failed');
      }
      return '';
    }
    if (command.includes('npm run node:version')) {
      if (npmState.nodeVersion !== 'v18.17.0') {
        throw new Error('Node version check failed');
      }
      return npmState.nodeVersion;
    }
    if (command.includes('npm run test:unit')) {
      if (!npmState.testsPass) {
        throw new Error('Test check failed');
      }
      return '';
    }
    if (command.includes('npx lint-staged')) {
      if (!npmState.lintPass) {
        throw new Error('Lint check failed');
      }
      return '';
    }
    if (command.includes('npx tsc')) {
      if (!npmState.typePass) {
        throw new Error('Type check failed');
      }
      return '';
    }
    return '';
  });
};

describe('git-hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockState();
  });

  describe('runPreCommitChecks', () => {
    it('should run lint-staged with correct config', async () => {
      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
    });

    it('should type check staged TypeScript files', async () => {
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
      setupMockState({ ...mockGitState, hasTypeScriptFiles: false });
      await runPreCommitChecks(mockExecSync);

      expect(mockExecSync).toHaveBeenCalledTimes(3);

      expect(mockExecSync).toHaveBeenCalledWith(
        'npx lint-staged --config configs/lint/.lintstagedrc.json',
        expect.any(Object)
      );
    });

    it('should handle grep returning non-zero when no TypeScript files are found', async () => {
      mockExecSync.mockImplementation((cmd, opts) => {
        if (
          cmd ===
          'git diff --cached --name-only --diff-filter=ACMR | grep -E \\.tsx?$'
        ) {
          throw new Error('grep: no matches found');
        }
        return '';
      });

      await runPreCommitChecks(mockExecSync);

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

    it('should pass when there are no linting or type errors', async () => {
      await expect(runPreCommitChecks(mockExecSync)).resolves.not.toThrow();
    });

    it('should fail when there are linting errors', async () => {
      setupMockState(mockGitState, { ...mockNpmState, lintPass: false });
      await expect(runPreCommitChecks(mockExecSync)).rejects.toThrow(
        'Lint check failed'
      );
    });

    it('should fail when there are type errors', async () => {
      setupMockState(mockGitState, { ...mockNpmState, typePass: false });
      await expect(runPreCommitChecks(mockExecSync)).rejects.toThrow(
        'Type check failed'
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
      expect(mockExecSync).toHaveBeenCalledTimes(1);
    });

    it('should run all pre-push checks in sequence', async () => {
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
      await expect(runPrePushChecks(mockExecSync)).resolves.not.toThrow();
    });

    it('should fail when tests fail', async () => {
      setupMockState(mockGitState, { ...mockNpmState, testsPass: false });
      await expect(runPrePushChecks(mockExecSync)).rejects.toThrow(
        'Test check failed'
      );
    });

    it('should fail when Node version is incorrect', async () => {
      setupMockState(mockGitState, { ...mockNpmState, nodeVersion: 'v16.0.0' });
      await expect(runPrePushChecks(mockExecSync)).rejects.toThrow(
        'Node version check failed'
      );
    });
  });
});
