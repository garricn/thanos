import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/tests/**/*.ts', '**/tests/**/*.tsx', '**/tests/**/*.js', '**/tests/**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': 'off'
    }
  }
];
