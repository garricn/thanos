import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/e2e/**'],
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        'coverage/**',
        'dist/**',
        '**/e2e/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/main.ts',
      ],
    },
    reporters: ['default', 'vitest-sonar-reporter'],
    outputFile: {
      'vitest-sonar-reporter': './test-report.xml',
    },
  },
});
