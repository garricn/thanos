/** @type {import('jest').Config} */
export default {
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/scripts/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage/scripts',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};
