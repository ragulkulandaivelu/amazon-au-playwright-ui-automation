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

  /**
   * Requirement 1: Home Page Verification
   * Instruction: "Capture a full-page screenshot."
   */
  test('1. Home Page Verification', async () => {
    await amazonHome.verifyHomePageElements();
    
    // Explicitly triggers full-page scrolling capture
    await amazonHome.captureScreenshot('01-home-page-verification.png', { fullPage: true });
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
    
    // Captures a viewport-specific screenshot
    await amazonHome.captureScreenshot('02-electronics-category.png', { fullPage: false });
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

    // Captures a viewport-specific screenshot
    await amazonHome.captureScreenshot('03-search-wireless-headphones.png', { fullPage: false });
  });
});
