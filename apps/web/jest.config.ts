export default {
  displayName: 'web',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
    '<rootDir>/tests/**/*(*.)@(spec|test).[jt]s?(x)',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/test-setup.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/*.spec.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.config.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/nx-welcome.tsx', // Generated demo component
    '!<rootDir>/src/**/*.stories.{js,jsx,ts,tsx}', // Storybook files
    '!<rootDir>/src/**/*.styles.{js,jsx,ts,tsx}', // Style files
    '!<rootDir>/src/**/*.constants.{js,jsx,ts,tsx}', // Constant definitions
    '!<rootDir>/src/**/*.types.{js,jsx,ts,tsx}', // Type definitions
    '!<rootDir>/src/**/*.mock.{js,jsx,ts,tsx}', // Mock files
    '!<rootDir>/src/**/*.generated.{js,jsx,ts,tsx}', // Generated files
    '!<rootDir>/src/**/*.module.css', // CSS modules
    '!<rootDir>/src/**/assets/**', // Asset files
    '!<rootDir>/src/**/*.json', // JSON files
    '!<rootDir>/src/**/*.md', // Markdown files
  ],
};
