export default {
  displayName: 'web',
  preset: undefined,
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
  coverageDirectory: '../../coverage/apps/web',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
    '<rootDir>/tests/**/*(*.)@(spec|test).[jt]s?(x)',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/test-setup.ts',
    '../../scripts/jest.setup.js',
  ],
  testResultsProcessor: 'jest-sonar-reporter',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: ['/node_modules/(?!.*\\.mjs$)'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/*.spec.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.snapshot.spec.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/__snapshots__/**',
    '!<rootDir>/src/**/*.config.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.stories.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.styles.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.constants.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.types.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.mock.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.generated.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.module.css',
    '!<rootDir>/src/**/assets/**',
    '!<rootDir>/src/**/*.json',
    '!<rootDir>/src/**/*.md',
  ],
};
