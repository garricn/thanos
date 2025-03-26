import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    include: [path.resolve(__dirname, '__tests__/**/*.test.js')],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['bin/**/*.js', 'hooks/**/*.js'],
      exclude: ['**/*.test.js', 'coverage/**', 'dist/**', '**/*.config.js'],
    },
    reporters: ['default'],
  },
});
