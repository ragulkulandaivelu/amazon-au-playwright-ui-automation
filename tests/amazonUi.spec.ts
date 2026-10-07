import { test, expect } from '@playwright/test';
import { AmazonHomePage } from '../pages/AmazonHome.page';

// UPGRADE: Added 'www.' prefix to prevent temporary redirect (301) latency failures during test initialization
const HOME_PAGE_URL = 'https://www.amazon.com.au';
const TARGET_SEARCH_TERM = 'wireless headphones';

test.describe('Part A — Amazon Australia UI Automation Suite', () => {
  let amazonHome: AmazonHomePage;

  test.beforeEach(async ({ page }) => {
    // Set a consistent desktop resolution to force the correct navigation bar layout grid to render
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(HOME_PAGE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    amazonHome = new AmazonHomePage(page);
  });

  //  GLOBAL FAILURE HANDLER: Captures a fallback screenshot ONLY if a test breaks mid-way
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const failureBuffer = await page.screenshot({ fullPage: false });
      
      await testInfo.attach('❌ FAILURE-FALLBACK-SCREENSHOT', {
        body: failureBuffer,
        contentType: 'image/png'
      });
    }
  });

  /**
   * Requirement 1: Home Page Verification
   * Instruction: "Capture a full-page screenshot."
   */
  test('1. Home Page Verification', async () => {
    await amazonHome.verifyHomePageElements();
    
    // Capture a full-page buffer natively to override default reporting hooks
    const fullPageBuffer = await amazonHome.page.screenshot({ fullPage: true });

    // Attach it cleanly to the test runners info stream
    await test.info().attach('01-home-page-verification.png', {
      body: fullPageBuffer,
      contentType: 'image/png'
    });
  });

  /**
   * Requirement 2: Category Navigation
   * Instruction: "Capture a screenshot."
   */
  test('2. Category Navigation', async ({ page }) => {
    await amazonHome.navigateToElectronicsCategory();

    // Verification landing page routes
    await expect(page).toHaveURL(/.*electronics.*|.*node=4851799051.*/i);
    await expect(amazonHome.electronicsCategoryHeader).toBeVisible({ timeout: 15000 });
    
    // Capture standard viewport buffer (fullPage: false)
    const viewportBuffer = await page.screenshot({ fullPage: false });

    // Attach cleanly to the report
    await test.info().attach('02-electronics-category.png', {
      body: viewportBuffer,
      contentType: 'image/png'
    });
  });

  /**
   * Requirement 3: Search Functionality
   * Instruction: "Capture a screenshot."
   */
  test('3. Search Functionality', async ({ page }) => {
    await amazonHome.searchInput.fill(TARGET_SEARCH_TERM);

    // Concurrently handle search button execution to block race conditions
    await Promise.all([
      page.waitForURL(/\/s\?/i, { timeout: 15000 }),
      amazonHome.searchSubmitButton.click(),
    ]);

    // Validation checks
    await expect(page).toHaveURL(/\/s\?/i);
    await expect(amazonHome.searchInput).toHaveValue(TARGET_SEARCH_TERM);
    
    // UPGRADE: Converted the literal string check into a flexible Regular Expression pattern match. 
    // This protects the test if Amazon changes the result header dynamically from "wireless headphones" to "Wireless Headphones".
    await expect(amazonHome.searchResultHeader).toContainText(new RegExp(TARGET_SEARCH_TERM, 'i'));
    await expect(amazonHome.firstSearchResultCard).toBeVisible({ timeout: 15000 });

    // Capture standard viewport buffer (fullPage: false)
    const searchBuffer = await page.screenshot({ fullPage: false });

    // Attach cleanly to the report
    await test.info().attach('03-search-wireless-headphones.png', {
      body: searchBuffer,
      contentType: 'image/png'
    });
  });
});
