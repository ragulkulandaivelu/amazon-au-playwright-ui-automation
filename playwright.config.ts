import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,           // Concurrency between file specs
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Flake mitigation catchers
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15000,
    navigationTimeout: 20000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium-ui',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*amazonUi\.spec\.ts/,
    },
    {
      name: 'api-pipeline',
      use: { browserName: 'chromium', headless: true },
      testMatch: /.*petstoreApi\.spec\.ts/,
    }
  ]
});
