import baseConfig from "./playwright.config";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  ...baseConfig,
  webServer: undefined,
  use: {
    ...baseConfig.use,
    baseURL: process.env.PRODUCTION_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? "https://azure-quest-pwa.vercel.app"
  },
  projects: [
    { name: "production-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "production-mobile", use: { ...devices["iPhone 12"], viewport: { width: 390, height: 844 } } }
  ]
});
