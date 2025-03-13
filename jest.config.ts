export default {
  displayName: 'thanos',
  preset: './jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
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
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
