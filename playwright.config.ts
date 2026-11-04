import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    testDir: './tests',
    outputDir: 'test-results',

    // Runs global-setup.ts once before all tests:
    // visits Amazon AU, clears the bot-check page, saves session cookies
    globalSetup: './global-setup.ts',

    // Retry once in CI — absorbs any remaining transient bot-check pages
    retries: process.env.CI ? 1 : 0,

    // Single worker in CI — parallel headless runs increase bot-detection risk
    workers: process.env.CI ? 1 : undefined,

    // ── Reporters ─────────────────────────────────────────────────────────────
    reporter: [
        ['list'],
        // Playwright HTML report → playwright-report/index.html
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        // Allure raw data → allure-results/ (run allure:serve to view)
        ['allure-playwright'],
        // Reporting Labs single HTML → reporting-labs/index.html
        ['reporting-labs', { configFile: './reporting-labs.config.ts' }],
    ],

    use: {
        baseURL: process.env.BASE_URL ?? 'https://www.amazon.com.au',

        // Reuse session saved by global-setup — bot-check already cleared
        storageState: 'auth/amazon-state.json',

        // Human-like browser identity
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/124.0.0.0 Safari/537.36',
        locale: 'en-AU',
        timezoneId: 'Australia/Sydney',
        viewport: { width: 1280, height: 720 },

        // Screenshots / traces on failure — attached to all three reports
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
                channel: 'chrome',   // real Chrome = less detectable than Chromium
                launchOptions: {
                    // slowMo goes inside launchOptions (BrowserType.launch option)
                    slowMo: process.env.CI ? 500 : 0,
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
                // API tests don't need browser session or storageState
                storageState: undefined,
            },
        },
    ],
});
