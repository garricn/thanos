import type { Config } from 'jest';
import { join } from 'path';

const rootDir = join(__dirname, '../..');

const config: Config = {
  displayName: 'thanos',
  testEnvironment: 'node',
  rootDir,
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': 'babel-jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [
          '@babel/preset-env',
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: join(rootDir, 'coverage/thanos'),
  collectCoverageFrom: [
    'apps/**/*.{js,jsx,ts,tsx}',
    '!apps/**/*.d.ts',
    '!apps/**/*.spec.{js,jsx,ts,tsx}',
    '!apps/**/*.test.{js,jsx,ts,tsx}',
    '!apps/**/*.config.{js,jsx,ts,tsx}',
    '!apps/**/node_modules/**',
    '!apps/**/dist/**',
    '!apps/**/coverage/**',
    '!apps/**/*.stories.{js,jsx,ts,tsx}',
    '!apps/**/*.styles.{js,jsx,ts,tsx}',
    '!apps/**/*.constants.{js,jsx,ts,tsx}',
    '!apps/**/*.types.{js,jsx,ts,tsx}',
    '!apps/**/*.mock.{js,jsx,ts,tsx}',
    '!apps/**/*.generated.{js,jsx,ts,tsx}',
    '!apps/**/*.module.css',
    '!apps/**/assets/**',
    '!apps/**/*.json',
    '!apps/**/*.md',
    '!apps/**/migrations/**',
    '!apps/**/seeds/**',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: [join(rootDir, 'scripts/configs/jest.setup.js')],
  testResultsProcessor: 'jest-sonar-reporter',
  globals: {
    'jest-sonar-reporter': {
      outputDirectory: './coverage',
      outputName: 'sonar-report.xml',
      relativePaths: true,
    },
  },
  // Shared moduleNameMapper for ESM support
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Projects configuration
  projects: [
    {
      displayName: 'api',
      testEnvironment: 'node',
      transform: {
        '^.+\\.[tj]s$': [
          'ts-jest',
          {
            tsconfig: join(rootDir, 'apps/api/tsconfig.json'),
            useESM: true,
            module: 'esnext',
          },
        ],
      },
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^(\\.{1,2}/.*)\\.ts$': '$1',
      },
      extensionsToTreatAsEsm: ['.ts'],
      moduleFileExtensions: ['ts', 'js', 'html'],
      coverageDirectory: join(rootDir, 'coverage/apps/api'),
      testMatch: [
        join(rootDir, 'apps/api/tests/**/*.test.ts'),
        join(rootDir, 'apps/api/tests/**/*.spec.ts'),
        join(rootDir, 'apps/api/tests/src/**/*.test.ts'),
        join(rootDir, 'apps/api/tests/src/**/*.spec.ts'),
      ],
      rootDir: rootDir,
      setupFilesAfterEnv: [join(rootDir, 'scripts/configs/jest.setup.js')],
    },
    {
      displayName: 'api-e2e',
      testEnvironment: 'node',
      transform: {
        '^.+\\.[tj]s$': [
          'ts-jest',
          {
            useESM: true,
            tsconfig: join(rootDir, 'apps/api/e2e/tsconfig.json'),
          },
        ],
      },
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      extensionsToTreatAsEsm: ['.ts'],
      moduleFileExtensions: ['ts', 'js', 'html'],
      coverageDirectory: join(rootDir, 'coverage/apps/api/e2e'),
      testMatch: [
        join(rootDir, 'apps/api/e2e/src/**/?(*.)+(spec|test).[jt]s?(x)'),
      ],
      globalSetup: join(rootDir, 'apps/api/e2e/src/support/global-setup.ts'),
      globalTeardown: join(
        rootDir,
        'apps/api/e2e/src/support/global-teardown.ts'
      ),
      setupFilesAfterEnv: [
        join(rootDir, 'apps/api/e2e/src/support/test-setup.ts'),
      ],
      rootDir: rootDir,
    },
    {
      displayName: 'web',
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.[tj]sx?$': [
          'babel-jest',
          {
            presets: [
              ['@babel/preset-env', { targets: { node: 'current' } }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        ],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      coverageDirectory: join(rootDir, 'coverage/apps/web'),
      testMatch: [
        join(rootDir, 'apps/web/src/**/__tests__/**/*.[jt]s?(x)'),
        join(rootDir, 'apps/web/src/**/*(*.)@(spec|test).[jt]s?(x)'),
        join(rootDir, 'apps/web/tests/**/*(*.)@(spec|test).[jt]s?(x)'),
      ],
      setupFilesAfterEnv: [
        join(rootDir, 'apps/web/tests/test-setup.ts'),
        join(rootDir, 'scripts/configs/jest.setup.js'),
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': join(rootDir, 'apps/web/src/$1'),
      },
      transformIgnorePatterns: ['/node_modules/(?!.*\\.mjs$)'],
      rootDir: rootDir,
    },
  ],
};

export default config;
