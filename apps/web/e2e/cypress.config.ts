import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'npx nx run web:serve',
        production: 'npx nx run web:serve:production',
      },
      ciWebServerCommand: 'npx nx run web:serve:production',
      ciBaseUrl: 'http://localhost:4300',
    }),
    baseUrl: 'http://localhost:4200',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // Increase server start timeout
      config.defaultCommandTimeout = 120000;
      config.pageLoadTimeout = 120000;
      config.requestTimeout = 120000;
      return config;
    },
  },
});
