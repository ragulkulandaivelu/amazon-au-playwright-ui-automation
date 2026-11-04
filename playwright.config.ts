import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
 
export default defineConfig({
    testDir: './tests',
    outputDir: 'test-results',
 
    // Retry once in CI to absorb transient Amazon bot-check pages
    retries: process.env.CI ? 1 : 0,
 
    // One worker in CI — parallel headless runs increase bot-detection risk
    workers: process.env.CI ? 1 : undefined,
 
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        ['allure-playwright'],
    ],
 
    use: {
        baseURL: process.env.BASE_URL ?? 'https://www.amazon.com.au',
 
        // Fix: slowMo belongs here in the top-level use block, NOT inside launchOptions
        // slowMo is a PlaywrightTestOptions property, not a BrowserType.launch() option
        slowMo: process.env.CI ? 500 : 0,
 
        // Human-like browser settings
        viewport: { width: 1280, height: 720 },
        locale: 'en-AU',
        timezoneId: 'Australia/Sydney',
 
        // Screenshots and traces on failure
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
 
        actionTimeout: 20000,
        navigationTimeout: 30000,
    },
 
    projects: [
        // ── UI project — Amazon Australia ──────────────────────────────────
        {
            name: 'chromium-ui',
            testMatch: '**/amazonUi.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
                // Anti-bot flags go inside launchOptions (browser launch args only)
                launchOptions: {
                    args: [
                        '--disable-blink-features=AutomationControlled',
                        '--disable-dev-shm-usage',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ],
                },
            },
        },
 
        // ── API project — Swagger Petstore ─────────────────────────────────
        {
            name: 'api-pipeline',
            testMatch: '**/petstoreApi.spec.ts',
            use: {
                baseURL: 'https://petstore.swagger.io/v2',
            },
        },
    ],
});
 
