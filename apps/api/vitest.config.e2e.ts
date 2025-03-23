import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['e2e/src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', 'coverage/**', 'dist/**'],
    },
    testTimeout: 30000,
  },
});
