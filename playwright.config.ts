import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);

/**
 * Tests e2e sur le build de production (`pnpm build` au préalable).
 * PW_CHANNEL=msedge (ou chrome) permet d'utiliser un navigateur déjà installé.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    channel: process.env.PW_CHANNEL,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.PW_CHANNEL } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/fr`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
