import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'apps/web/e2e/**/*.cy.{js,jsx,ts,tsx}', // Adjusted path
    supportFile: 'apps/web/e2e/support/e2e.ts', // Adjusted path
    setupNodeEvents(on, config) {
      config.defaultCommandTimeout = 120000;
      config.pageLoadTimeout = 120000;
      config.requestTimeout = 120000;
      return config;
    },
  },
});
