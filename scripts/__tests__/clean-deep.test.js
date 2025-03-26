/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupMockDefaults } from './test-utils.js';

// Import the cleanDeep function directly
import { cleanDeep } from '../lib/shell-utils.js';

// Mock the shell-utils module
vi.mock('../lib/shell-utils.js', () => ({
  cleanDeep: vi.fn(),
}));

describe('clean-deep', () => {
  beforeEach(() => {
    // Setup default mocks and clear them
    setupMockDefaults();
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
