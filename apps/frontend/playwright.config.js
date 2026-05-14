// Keep this config in JS so app type-check/build does not require Playwright types.

/** @type {import('playwright').PlaywrightTestConfig} */
const config = {
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    port: 3100,
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_BGM_URL: "/audio/e2e-track.mp3",
      NEXT_PUBLIC_BGM_URLS: "",
    },
  },
};

module.exports = config;
