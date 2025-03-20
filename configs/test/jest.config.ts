export default {
  displayName: 'thanos',
  testEnvironment: 'node',
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
  coverageDirectory: './coverage/thanos',
  projects: [
    '<rootDir>/apps/*/configs/test/jest.config.{ts,mjs}',
    '<rootDir>/apps/*/e2e/configs/test/jest.config.{ts,mjs}',
    '<rootDir>/apps/*/tests/configs/test/jest.config.{ts,mjs}',
  ],
  testMatch: [],
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
  setupFilesAfterEnv: ['<rootDir>/scripts/jest.setup.js'],
  testResultsProcessor: 'jest-sonar-reporter',
  globals: {
    'jest-sonar-reporter': {
      outputDirectory: './coverage',
      outputName: 'sonar-report.xml',
      relativePaths: true,
    },
  },
};
