// Keep this config in JS so app type-check/build does not require Playwright types.

/** @type {import('playwright').PlaywrightTestConfig} */
const config = {
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["list"],
  ],

  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: !process.env.HEADED,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run dev -- --port 3100",
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_BGM_URL: "/audio/e2e-track.mp3",
      NEXT_PUBLIC_BGM_URLS: "",
    },
  },
};

module.exports = config;
