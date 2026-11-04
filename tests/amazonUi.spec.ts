import { test, expect } from '@playwright/test';
import { AmazonHomePage } from '../pages/AmazonHome.page';
import { meta } from 'reporting-labs';

const HOME_PAGE_URL = 'https://www.amazon.com.au';
const TARGET_SEARCH_TERM = 'wireless headphones';

test.describe('Part A — Amazon Australia UI Automation Suite', () => {
  let amazonHome: AmazonHomePage;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(HOME_PAGE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    amazonHome = new AmazonHomePage(page);
  });

  test('1. Home Page Verification', async () => {
    meta({ feature: 'Homepage', priority: 'P1', owner: 'Ragul' });

    await amazonHome.verifyHomePageElements();
    const fullPageBuffer = await amazonHome.page.screenshot({ fullPage: true });
    await test.info().attach('01-home-page-verification.png', {
      body: fullPageBuffer,
      contentType: 'image/png'
    });
  });

  test('2. Category Navigation', async ({ page }) => {
    meta({ feature: 'Navigation', priority: 'P2', owner: 'Ragul' });

    await amazonHome.navigateToElectronicsCategory();
    await expect(page).toHaveURL(/.*electronics.*|.*node=4851799051.*/i);
    await expect(amazonHome.electronicsCategoryHeader).toBeVisible({ timeout: 15000 });
    
    const viewportBuffer = await page.screenshot({ fullPage: false });
    await test.info().attach('02-electronics-category.png', {
      body: viewportBuffer,
      contentType: 'image/png'
    });
  });

  test('3. Search Functionality', async ({ page }) => {
    meta({ feature: 'Search', priority: 'P1', owner: 'Ragul' });

    await amazonHome.searchInput.fill(TARGET_SEARCH_TERM);
    await Promise.all([
      page.waitForURL(/\/s\?/i, { timeout: 15000 }),
      amazonHome.searchSubmitButton.click(),
    ]);

    await expect(page).toHaveURL(/\/s\?/i);
    await expect(amazonHome.searchInput).toHaveValue(TARGET_SEARCH_TERM);
    await expect(amazonHome.searchResultHeader).toContainText(new RegExp(TARGET_SEARCH_TERM, 'i'));
    await expect(amazonHome.firstSearchResultCard).toBeVisible({ timeout: 15000 });

    const searchBuffer = await page.screenshot({ fullPage: false });
    await test.info().attach('03-search-wireless-headphones.png', {
      body: searchBuffer,
      contentType: 'image/png'
    });
  });
});
