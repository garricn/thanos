import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/e2e/**'],
    coverage: {
      enabled: true,
      provider: 'custom',
      customProviderModule: 'vitest-monocart-coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.{test,spec}.{ts,tsx}',
        'coverage/**',
        'dist/**',
        '**/e2e/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/vite-env.d.ts',
      ],
      reportsDirectory: path.resolve(__dirname, '../../coverage/web'),
      all: true,
      reporter: ['text', 'lcov'],
    },
    reporters: [
      'default',
      [
        'vitest-sonar-reporter',
        {
          outputFile: path.resolve(__dirname, '../../coverage/web/sonar-report.xml'),
          testFilePath: '<absolute>',
        },
      ],
    ],
    testTimeout: 30000,
  },
});
