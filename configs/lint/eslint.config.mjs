// Root ESLint configuration
import baseConfig from './eslint.base.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/coverage',
      '**/*.json',
      '**/*.md',
      '**/*.css',
      '**/jest.config.ts',
      '**/babel.config.js',
      '**/tailwind.config.js',
      '**/postcss.config.js',
      '**/vite.config.ts',
      '**/vitest.config.ts',
      '**/cypress.config.ts',
      '**/build.js',
      '**/scripts',
      '**/public',
      '**/temp',
      '**/tmp',
      '**/.github',
      '**/e2e/src/*.js',
      '**/e2e/src/*.jsx',
      '**/e2e/src/**/*.js',
      '**/e2e/src/**/*.jsx',
      '**/tests/*.js',
      '**/tests/*.jsx',
      '**/tests/**/*.js',
      '**/tests/**/*.jsx',
    ],
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  // Special rules for test files
  {
    files: [
      '**/tests/**/*.ts',
      '**/tests/**/*.tsx',
      '**/tests/**/*.js',
      '**/tests/**/*.jsx',
    ],
    rules: {},
  },
];
