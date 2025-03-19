import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'src/support/e2e.ts',
    setupNodeEvents(on, config) {
      // Increase server start timeout
      config.defaultCommandTimeout = 120000;
      config.pageLoadTimeout = 120000;
      config.requestTimeout = 120000;
      return config;
    },
  },
});
