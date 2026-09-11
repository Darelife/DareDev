import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:3100',
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'node tests/fixture-api.mjs', url: 'http://127.0.0.1:4101', timeout: 10_000 },
    { command: 'npx next dev --port 3100', url: 'http://localhost:3100', timeout: 120_000, stderr: 'ignore',
      env: { NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4101' } },
  ],
});
