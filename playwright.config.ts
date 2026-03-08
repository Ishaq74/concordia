import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  retries: 2,
  timeout: 120000,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { channel: 'chrome' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    // on Windows the inline environment variable syntax fails, so use 'env' property
    command: 'pnpm run dev',
    url: 'http://localhost:4321',
    timeout: 120000,
    reuseExistingServer: true,
    env: {
      USE_DB_TEST: 'true',
    },
  },
});