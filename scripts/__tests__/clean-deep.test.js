/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockExecSync, setupBeforeEach } from './test-utils.js';

// The module under test will import shell-utils, so we need to mock that
vi.mock('../lib/shell-utils.js', () => {
  return {
    cleanDeep: vi.fn(),
  };
});

// Import the cleanDeep function directly
import { cleanDeep } from '../lib/shell-utils.js';

describe('clean-deep', () => {
  setupBeforeEach();

  beforeEach(() => {
    // Clear mock calls between tests
    vi.clearAllMocks();

    // Mock process.argv
    vi.spyOn(process, 'argv', 'get').mockReturnValue([
      'node',
      'clean-deep.js',
      '--force',
      '--dry-run',
    ]);
  });

  it('should call cleanDeep function with arguments when the script is executed', () => {
    // Execute the script to trigger cleanDeep
    return import('../bin/clean-deep.js').then(() => {
      // Assert that cleanDeep was called with the correct arguments
      expect(cleanDeep).toHaveBeenCalledWith(['--force', '--dry-run']);
    });
  });
});
