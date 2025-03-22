import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-config-prettier';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Base JavaScript rules
  {
    files: ['**/*.{js,mjs,ts,tsx,cts,mts,cjs,jsx}'],
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
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
      '**/scripts/**',
      '**/public/**',
      '**/temp/**',
      '**/tmp/**',
      '**/.github/**',
      '**/e2e/src/*.{js,jsx}',
      '**/e2e/src/**/*.{js,jsx}',
      '**/tests/*.{js,jsx}',
      '**/tests/**/*.{js,jsx}',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      ...js.configs.recommended.rules,
      quotes: ['error', 'single'],
      'eol-last': ['error', 'always'],
    },
  },
  // TypeScript and extended configs
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    rules: {
      ...compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier' // Ensure Prettier is last
      )[0].rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  // JavaScript-specific overrides
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off', // For CommonJS modules
    },
  },
  // Sub-project specific overrides (optional)
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      // Add React-specific overrides if needed
    },
  },
  {
    files: ['apps/api/**/*.{ts}', 'scripts/**/*.{ts}'],
    rules: {
      // Add Node.js-specific overrides if needed
    },
  },
];
