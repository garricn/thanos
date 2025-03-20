export default {
  displayName: 'api-tests',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/configs/test/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/api/tests',
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/*.test.ts',
  ],
  setupFilesAfterEnv: ['../../../jest.setup.js'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/configs/test/tsconfig.spec.json',
    },
  },
};
