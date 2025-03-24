import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    include: [
      'apps/api/tests/**/*.test.ts',
      'apps/web/tests/**/*.{test,spec}.{ts,tsx}',
      'apps/web/src/**/*.{test,spec}.{ts,tsx}',
      'scripts/__tests__/**/*.test.js',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/e2e/**'],
    coverage: {
      enabled: true,
      provider: 'custom',
      customProviderModule: 'vitest-monocart-coverage',
      include: [
        'apps/api/src/**/*.ts',
        'apps/web/src/**/*.{ts,tsx}',
        'scripts/bin/**/*.js',
        'scripts/hooks/**/*.js',
      ],
      exclude: [
        '**/*.{test,spec}.{ts,tsx}',
        'coverage/**',
        'dist/**',
        '**/e2e/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'apps/web/playwright.config.ts',
        '**/vite-env.d.ts',
      ],
      all: true,
      reporter: ['text', 'lcov'],
    },
    reporters: ['default'],
  },
});
