/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockExecSync, setupBeforeEach } from './test-utils.js';

// The module under test will import shell-utils, so we need to mock that
vi.mock('../lib/shell-utils.js', () => {
  return {
    switchNodeVersion: vi.fn(),
  };
});

// Import the switchNodeVersion function directly
import { switchNodeVersion } from '../lib/shell-utils.js';

describe('switch-node', () => {
  setupBeforeEach();

  beforeEach(() => {
    // Clear mock calls between tests
    vi.clearAllMocks();
  });

  it('should call switchNodeVersion function when the script is executed', () => {
    // Execute the script to trigger switchNodeVersion
    // We need to use dynamic import to execute the script after the mocks are set up
    return import('../bin/switch-node.js').then(() => {
      // Assert that switchNodeVersion was called
      expect(switchNodeVersion).toHaveBeenCalled();
    });
  });
});
