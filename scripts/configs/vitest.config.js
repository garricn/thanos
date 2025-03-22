import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Match script test files
    include: ['**/__tests__/**/*.test.js'],
    // Exclude node_modules
    exclude: ['**/node_modules/**'],
    // Environment setup
    environment: 'node',
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', '**/*.test.js', '**/test-utils.js'],
    },
    // Test timeout
    testTimeout: 10000,
    // Setup files
    setupFiles: ['./scripts/__tests__/test-utils.js'],
  },
});
