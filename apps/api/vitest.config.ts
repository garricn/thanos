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
      ],
      reportsDirectory: path.resolve(__dirname, '../../coverage/api'),
      all: true,
    },
    testTimeout: 30000,
  },
});
