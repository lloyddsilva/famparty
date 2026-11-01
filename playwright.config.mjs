import { defineConfig } from "@playwright/test";

// Guard: never run suites against the production site (and therefore the
// production Redis) unless explicitly flagged. Local runs use the in-memory
// store when KV_REST_API_URL is unset.
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
if (/famparty\.vercel\.app/.test(baseURL) && process.env.ALLOW_PROD_E2E !== "1") {
  throw new Error(`Refusing to run Playwright against production (${baseURL}). Set ALLOW_PROD_E2E=1 only for a deliberate, small production check.`);
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL },
});
