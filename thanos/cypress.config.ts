import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: "e2e/src/support/e2e.ts",
    specPattern: "e2e/src/e2e/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:4200"
  }
});
