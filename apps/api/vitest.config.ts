import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/e2e/**'],
    coverage: {
      enabled: true, // Explicitly enable coverage
      provider: 'custom',
      customProviderModule: 'vitest-monocart-coverage',
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        'coverage/**',
        'dist/**',
        '**/e2e/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
      ],
      reportsDirectory: path.resolve(__dirname, '../../coverage/api'),
      all: true,
      reporter: ['text', 'lcov'], // Keep for now, adjust later if needed
    },
    reporters: [
      'default',
      [
        'vitest-sonar-reporter',
        {
          outputFile: path.resolve(__dirname, '../../coverage/api/sonar-report.xml'),
          testFilePath: '<absolute>',
        },
      ],
    ],
    testTimeout: 30000,
  },
});
