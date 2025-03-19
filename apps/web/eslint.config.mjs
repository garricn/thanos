import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
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
    // Web-specific ESLint rules
    rules: {
      'react/prop-types': 'off', // We use TypeScript instead
    },
  },
];
