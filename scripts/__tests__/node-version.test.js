/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockExecSync, setupBeforeEach } from './test-utils.js';

// The module under test will import shell-utils, so we need to mock that
vi.mock('../lib/shell-utils.js', () => {
  return {
    checkNodeVersion: vi.fn(),
  };
});

// Import the checkNodeVersion function directly
import { checkNodeVersion } from '../lib/shell-utils.js';

describe('node-version', () => {
  setupBeforeEach();

  beforeEach(() => {
    // Clear mock calls between tests
    vi.clearAllMocks();
  });

  it('should call checkNodeVersion function when the script is executed', () => {
    // Execute the script to trigger checkNodeVersion
    // We need to use dynamic import to execute the script after the mocks are set up
    return import('../bin/node-version.js').then(() => {
      // Assert that checkNodeVersion was called
      expect(checkNodeVersion).toHaveBeenCalled();
    });
  });
});
