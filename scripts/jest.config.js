/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage/scripts',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};
