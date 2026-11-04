import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
 
export default defineConfig({
    testDir: './tests',
 
    // Clean old results before every run
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

 
        // Human-like browser settings
        // ── Fix 2: human-like browser flags ───────────────────────────────
        // Removes the "navigator.webdriver" JS flag that Amazon checks
        // and disables the AutomationControlled feature blink flag.
        launchOptions: {
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        },
 
        // Realistic viewport and Australian locale
        viewport: { width: 1280, height: 720 },
        locale: 'en-AU',
        timezoneId: 'Australia/Sydney',
 
        // 500 ms pause between actions — looks more human, reduces bot triggers
        slowMo: process.env.CI ? 500 : 0,
 
        // Screenshots and traces on failure for debugging
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
 
        // Global timeouts
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
                channel: 'chrome',   // use installed Chrome, not Chromium — less detectable
            },
        },
 
        // ── API project — Swagger Petstore ─────────────────────────────────
        {
            name: 'api-pipeline',
            testMatch: '**/petstoreApi.spec.ts',
            use: {
                // No browser needed for API tests
                baseURL: 'https://petstore.swagger.io/v2',
            },
        },
    ],
});
 
