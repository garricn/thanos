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
    testTimeout: 10000,
    environmentMatchGlobs: [
      ['apps/web/**/*.test.ts', 'jsdom'],
      ['apps/web/**/*.spec.ts', 'jsdom'],
      ['apps/api/**/*.test.ts', 'node'],
      ['apps/api/**/*.spec.ts', 'node'],
      ['scripts/**/*.test.ts', 'node'],
      ['scripts/**/*.spec.ts', 'node'],
    ],
    setupFiles: [
      path.resolve(process.cwd(), 'apps/web/tests/test-setup.ts'),
      path.resolve(process.cwd(), 'scripts/__tests__/test-utils.js'),
    ],
    include: ['**/*.(spec|test).ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
