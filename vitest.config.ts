import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    include: [
      'apps/*/tests/**/*.{test,spec}.{ts,tsx}',
      'apps/*/src/**/*.{test,spec}.{ts,tsx}',
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
        '**/vite-env.d.ts',
        'apps/web/playwright.config.ts',
      ],
      reportsDirectory: 'coverage', // Base dir, mcr will append /combined/lcov-report
      all: true,
      reporter: ['text', 'lcov'],
    },
    reporters: ['default'],
  },
});
