import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: path.resolve(__dirname, 'coverage'),
      include: ['**/*.ts'],
      exclude: ['**/*.test.ts', 'coverage/**', 'dist/**'],
    },
    testTimeout: 30000,
  },
});
