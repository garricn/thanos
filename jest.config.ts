export default {
  displayName: 'thanos',
  preset: './jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': 'babel-jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [
          '@babel/preset-env',
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: './coverage/thanos',
  projects: ['<rootDir>/apps/*/jest.config.ts'],
  testMatch: [],
  collectCoverageFrom: [
    'apps/**/*.{js,jsx,ts,tsx}',
    '!apps/**/*.d.ts',
    '!apps/**/*.spec.{js,jsx,ts,tsx}',
    '!apps/**/*.test.{js,jsx,ts,tsx}',
    '!apps/**/*.config.{js,jsx,ts,tsx}',
    '!apps/**/node_modules/**',
    '!apps/**/dist/**',
    '!apps/**/coverage/**',
    '!apps/**/*.stories.{js,jsx,ts,tsx}',
    '!apps/**/*.styles.{js,jsx,ts,tsx}',
    '!apps/**/*.constants.{js,jsx,ts,tsx}',
    '!apps/**/*.types.{js,jsx,ts,tsx}',
    '!apps/**/*.mock.{js,jsx,ts,tsx}',
    '!apps/**/*.generated.{js,jsx,ts,tsx}',
    '!apps/**/*.module.css',
    '!apps/**/assets/**',
    '!apps/**/*.json',
    '!apps/**/*.md',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testResultsProcessor: 'jest-sonar-reporter',
  globals: {
    'jest-sonar-reporter': {
      outputDirectory: './coverage',
      outputName: 'sonar-report.xml',
      relativePaths: true,
    },
  },
};
