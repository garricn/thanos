import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/combined',
      include: ['apps/web/src/**/*.{ts,tsx}', 'apps/api/src/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/scripts/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/vite-env.d.ts',
        '**/*.{test,spec}.{ts,tsx}',
      ],
    },
    reporters: ['default', 'vitest-sonar-reporter'],
    outputFile: {
      'vitest-sonar-reporter': './test-report.xml',
    },
    workspace: [
      {
        test: {
          name: 'web',
          globals: true,
          environment: 'jsdom',
          include: [
            'apps/web/src/**/*.{test,spec}.{ts,tsx}',
            'apps/web/tests/**/*.{test,spec}.{ts,tsx}',
          ],
        },
      },
      {
        test: {
          name: 'api',
          globals: true,
          environment: 'node',
          include: ['apps/api/src/**/*.test.ts', 'apps/api/tests/**/*.test.ts'],
        },
      },
    ],
  },
});
