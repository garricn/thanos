import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: path.resolve(process.cwd(), 'coverage'),
      include: ['apps/api/src/**', 'apps/web/src/**', 'scripts/**'],
      exclude: [
        'node_modules/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test-utils.ts',
        '**/test-setup.ts',
        'coverage/**',
        'dist/**',
        '**/lcov-report/**',
      ],
    },
    testTimeout: 30000,
    environment: 'node',
    environmentMatchGlobs: [
      ['**/web/**/*.{test,spec}.{ts,tsx}', 'jsdom'],
      ['**/web/tests/**/*.{test,spec}.{ts,tsx}', 'jsdom'],
    ],
    setupFiles: [
      path.resolve(process.cwd(), 'apps/web/tests/test-setup.ts'),
      path.resolve(process.cwd(), 'scripts/__tests__/test-utils.js'),
    ],
    include: [
      'apps/api/tests/**/*.test.ts',
      'apps/api/tests/src/**/*.test.ts',
      'apps/api/e2e/src/**/*.test.ts',
      'apps/api/e2e/src/api/**/*.test.ts',
      'apps/web/tests/**/*.test.ts',
      'apps/web/src/**/*.test.{ts,tsx}',
      'scripts/__tests__/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
