import { defineConfig, devices } from "@playwright/test";

/*
 * Tests de bout en bout sur l'application lancée (Next.js + Strapi + PostgreSQL
 * avec les données de démonstration), via `docker compose up` ou en local.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
