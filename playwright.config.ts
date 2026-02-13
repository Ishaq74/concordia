import { defineConfig, devices } from '@playwright/test';

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
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'mobile', use: devices['Pixel 5'] },
  ],
  webServer: {
    command: 'USE_DB_TEST=true npm run dev',
    url: 'http://localhost:4321',
    timeout: 120000,
  },
});