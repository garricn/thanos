export default {
  displayName: 'api-e2e',
  globalSetup: '<rootDir>/../../src/support/global-setup.ts',
  globalTeardown: '<rootDir>/../../src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/../../src/support/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/configs/test/tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/api-e2e',
  testMatch: ['<rootDir>/../../**/?(*.)+(spec|test).[jt]s?(x)'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
