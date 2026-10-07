import { defineConfig, devices } from '@playwright/test';
// 1. Ensure your reporting-labs dependencies are imported at the top
import reportinglabs from 'reporting-labs'; 
// 2. IMPORT your configuration file so Playwright can read your custom title
import reportingLabsConfig from './reporting-labs.config'; 

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,           
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, 
  workers: process.env.CI ? 4 : undefined,
  
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    // 3. FIX: Pass your custom configuration object directly into the plugin array parameters
    ['reporting-labs', reportingLabsConfig] 
  ],
  
  use: {
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15000,
    navigationTimeout: 20000,
    screenshot: 'off',
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
