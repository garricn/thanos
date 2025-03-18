module.exports = {
  reportPath: process.env.JEST_SONAR_REPORTER_OUTPUT_DIR || './coverage',
  reportFile: process.env.JEST_SONAR_REPORTER_OUTPUT_NAME || 'sonar-report.xml',
  indent: 2,
  sonarqubeVersion: '9.9',
  relativePaths: true,
  append: false,
};
