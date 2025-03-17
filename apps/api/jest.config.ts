export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  testMatch: [
    '<rootDir>/tests/src/**/*.test.ts',
    '<rootDir>/tests/src/**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/src/app.spec.ts',
    '<rootDir>/tests/src/main.path.spec.ts',
  ],
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
  ],
};
