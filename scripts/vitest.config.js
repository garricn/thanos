import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['scripts/__tests__/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['scripts/bin/**/*.js', 'scripts/hooks/**/*.js'],
      exclude: ['node_modules', 'dist', 'coverage', 'scripts/__tests__/**/*.test.js'],
      reportsDirectory: path.resolve(__dirname, 'coverage'),
      all: true,
    },
    setupFiles: [path.resolve(__dirname, '__tests__/setup.js')],
  },
});
