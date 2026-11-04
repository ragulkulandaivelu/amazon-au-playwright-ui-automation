import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
 
export default defineConfig({
    testDir: './tests',
    outputDir: 'test-results',
 
    // Runs global-setup.ts once before all tests: visits Amazon AU, clears the
    // "Continue shopping" bot-check page and saves the session to auth/amazon-state.json
    globalSetup: './global-setup.ts',
 
    // Whole-test limit. The default 30 s is too tight for Amazon through a CI runner.
    timeout: 90000,
    // Assertions (expect) wait up to 15 s
    expect: { timeout: 15000 },
 
    // Retry once in CI to absorb transient bot-check pages
    retries: process.env.CI ? 1 : 0,
 
    // One worker in CI: parallel headless runs increase bot-detection risk
    workers: process.env.CI ? 1 : undefined,
 
    // ── Reporters ─────────────────────────────────────────────────────────────
    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],   // playwright-report/index.html
        ['allure-playwright'],                                            // allure-results/
        ['reporting-labs'],                                               // reporting-labs/index.html (reads reporting-labs.config.ts)
    ],
 
    use: {
        baseURL: process.env.BASE_URL ?? 'https://www.amazon.com.au',
 
        // Reuse the session saved by global-setup (bot-check already cleared)
        storageState: 'auth/amazon-state.json',
 
        // Human-like browser identity
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/124.0.0.0 Safari/537.36',
        locale: 'en-AU',
        timezoneId: 'Australia/Sydney',
        viewport: { width: 1280, height: 720 },
 
        // Evidence on failure (attached to all reports)
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
 
        actionTimeout: 20000,
        navigationTimeout: 30000,
    },
 
    projects: [
        // ── UI project: Amazon Australia ──────────────────────────────────────
        {
            name: 'chromium-ui',
            testMatch: '**/amazonUi.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',   // real Chrome is less detectable than Chromium
                launchOptions: {
                    // slowMo is a browser launch option, so it lives here (not in top-level `use`)
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
 
        // ── API project: Swagger Petstore ─────────────────────────────────────
        {
            name: 'api-pipeline',
            testMatch: '**/petstoreApi.spec.ts',
            use: {
                baseURL: 'https://petstore.swagger.io/v2',
                storageState: undefined,   // API tests need no browser session
            },
        },
    ],
});
 