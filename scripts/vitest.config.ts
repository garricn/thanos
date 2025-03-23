import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [resolve(__dirname, '__tests__/**/*.test.js')],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: resolve(__dirname, 'coverage'),
      include: [resolve(__dirname, 'bin/**/*.js'), resolve(__dirname, 'hooks/**/*.js')],
      exclude: ['**/*.test.js', '**/coverage/**', '**/dist/**', '**/node_modules/**'],
    },
    testTimeout: 30000,
    setupFiles: [resolve(__dirname, '__tests__/test-utils.js')],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
});
