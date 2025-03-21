/** @type {import('jest').Config} */
export default {
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/scripts/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage/scripts',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'scripts/bin/**/*.js',
    'scripts/hooks/**/*.js',
    'scripts/lib/**/*.js',
    '!scripts/__tests__/**',
    '!scripts/configs/**',
    '!scripts/coverage/**',
    '!scripts/node_modules/**',
  ],
  verbose: true,
  transform: {},
  transformIgnorePatterns: ['/node_modules/(?!wait-on)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
