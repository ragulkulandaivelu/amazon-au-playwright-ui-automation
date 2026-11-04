import { chromium } from '@playwright/test';
import * as fs from 'fs';

/**
 * global-setup.ts
 *
 * Runs ONCE before the entire test suite in CI/CD.
 *
 * Problem:  Amazon shows a "Click the button below to continue shopping"
 *           bot-detection page to headless CI runners (GitHub Actions,
 *           Jenkins, Docker) because their IP ranges are on Amazon's blocklist.
 *
 * Solution: Visit Amazon once here, click through the bot-check if it appears,
 *           save session cookies to auth/amazon-state.json, and reuse that
 *           session in every test so the bot-check never blocks a test run.
 */
async function globalSetup() {
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ],
    });

    const context = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/124.0.0.0 Safari/537.36',
        locale: 'en-AU',
        timezoneId: 'Australia/Sydney',
        viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    console.log('\n[global-setup] Visiting Amazon AU...');
    await page.goto('https://www.amazon.com.au', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
    });

    // ── Handle bot-check page if it appears ──────────────────────────────────
    try {
        const continueBtn = page.getByRole('button', { name: /continue shopping/i });
        await continueBtn.waitFor({ state: 'visible', timeout: 8000 });
        console.log('[global-setup] Bot-check page detected — clicking Continue shopping...');
        await continueBtn.click();
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
        console.log('[global-setup] Bot-check cleared successfully.');
    } catch {
        console.log('[global-setup] No bot-check page — homepage loaded normally.');
    }

    // ── Confirm real homepage loaded ──────────────────────────────────────────
    await page
        .getByRole('searchbox')
        .waitFor({ state: 'visible', timeout: 20000 });

    // ── Save cookies & localStorage — reused by every test ───────────────────
    fs.mkdirSync('auth', { recursive: true });
    await context.storageState({ path: 'auth/amazon-state.json' });
    console.log('[global-setup] Session saved to auth/amazon-state.json\n');

    await browser.close();
}

export default globalSetup;
