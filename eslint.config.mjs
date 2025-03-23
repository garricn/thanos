import globals from 'globals';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-config-prettier';

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
      '**/babel.config.js',
      '**/tailwind.config.js',
      '**/postcss.config.js',
      '**/build.js',
      '**/public/**',
      '**/temp/**',
      '**/tmp/**',
      '**/.github/**',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest, // For test globals like describe, it, expect
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      quotes: ['error', 'single'],
      'eol-last': ['error', 'always'],
    },
  },
  // JavaScript config files
  {
    files: ['**/*.config.js', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      parser: js.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
  // TypeScript and extended configs
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: [
          './tsconfig.json',
          './apps/*/tsconfig.json',
          './apps/*/cypress/tsconfig.json',
          './scripts/tsconfig.json',
        ],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...prettierPlugin.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
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
  // Test file overrides
  {
    files: ['**/*.{spec,test}.{ts,tsx}', '**/e2e/**/*.{ts,tsx}', '**/cypress/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest, // For test globals
        cy: true, // For Cypress
        Cypress: true,
        expect: true,
        vi: true, // For Vitest
        describe: true,
        it: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
  },
  // Config file overrides
  {
    files: ['**/*.config.ts', '**/vite.config.ts', '**/vitest.config.ts', 'vitest.workspace.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.eslint.json'],
      },
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
