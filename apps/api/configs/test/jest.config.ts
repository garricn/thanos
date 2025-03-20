import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../../');

export default {
  displayName: 'api',
  testEnvironment: 'node',
  rootDir: projectRoot,
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/configs/test/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: path.resolve(projectRoot, '../../coverage'),
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.spec.ts'],
  testPathIgnorePatterns: ['<rootDir>/tests/src/main.path.spec.ts'],
  setupFilesAfterEnv: [
    path.resolve(projectRoot, '../../scripts/jest.setup.js'),
  ],
  testResultsProcessor: 'jest-sonar-reporter',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/**/*.test.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/*.config.ts',
    '!<rootDir>/src/**/*.constants.ts',
    '!<rootDir>/src/**/*.types.ts',
    '!<rootDir>/src/**/*.mock.ts',
    '!<rootDir>/src/**/*.generated.ts',
    '!<rootDir>/src/**/assets/**',
    '!<rootDir>/src/**/*.json',
    '!<rootDir>/src/**/*.md',
    '!<rootDir>/src/**/migrations/**',
    '!<rootDir>/src/**/seeds/**',
    '!<rootDir>/src/main.ts',
  ],
};
