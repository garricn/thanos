module.exports = {
  name: 'Thanos Coverage Report',
  reports: ['v8'],
  include: ['apps/*/coverage/coverage-final.json', 'scripts/coverage/coverage-final.json'],
  outputDir: 'coverage/combined',
  baseDir: process.cwd(),
  sourceFilter: sourcePath => sourcePath.replace(process.cwd(), ''),
  clean: true,
  thresholds: {
    // Production code (api/web)
    'apps/api/src/**/*.ts': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    'apps/web/src/**/*.{ts,tsx}': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    // Internal tooling (scripts)
    'scripts/**/*.js': {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
  },
};
