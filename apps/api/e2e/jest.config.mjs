/** @type {import('jest').Config} */
export default {
  displayName: 'api-e2e',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      useESM: true,
      tsconfig: './configs/test/tsconfig.spec.json',
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage',
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  globalSetup: './src/support/global-setup.ts',
  globalTeardown: './src/support/global-teardown.ts',
  setupFilesAfterEnv: ['./src/support/test-setup.ts']
};