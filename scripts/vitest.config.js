const { defineConfig } = require('vitest/config');
const path = require('path');

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['bin/**/*.js', 'hooks/**/*.js', '__tests__/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['bin/**/*.js', 'hooks/**/*.js'],
      exclude: ['node_modules', 'dist', 'coverage', '__tests__/**/*.test.js'],
      reportsDirectory: path.resolve(__dirname, 'coverage'),
      all: true,
    },
    setupFiles: [path.resolve(__dirname, '__tests__/setup.js')],
  },
});
