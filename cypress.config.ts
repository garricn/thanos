import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'apps/web/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'apps/web/cypress/support/e2e.ts',
    fixturesFolder: 'apps/web/cypress/fixtures',
    setupNodeEvents(on, config) {
      config.defaultCommandTimeout = 120000;
      config.pageLoadTimeout = 120000;
      config.requestTimeout = 120000;
      return config;
    },
  },
});
