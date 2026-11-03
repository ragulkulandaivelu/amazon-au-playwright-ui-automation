import { type Locator, type Page, expect, test } from '@playwright/test';
 
export class AmazonHomePage {
  readonly page: Page;
 
  constructor(page: Page) {
    this.page = page;
  }
 
  // ==================== Core Layout Locators ====================
 
  get amazonLogo(): Locator {
    return this.page.getByRole('link', { name: 'Amazon.com.au' }).first();
  }
 
  get searchInput(): Locator {
    return this.page.getByRole('searchbox', { name: 'Search Amazon.com.au' });
  }
 
  get searchSubmitButton(): Locator {
    return this.page.getByRole('button', { name: 'Go', exact: true });
  }
 
  get cartButton(): Locator {
    // Accessible name varies ("Cart", "0 items in cart"), so match loosely
    // and fall back to the stable nav id.
    return this.page
      .getByRole('link', { name: /cart/i })
      .or(this.page.locator('#nav-cart'))
      .first();
  }
 
  // ==================== Navigation Locators ====================
 
  get topNavElectronicsLink(): Locator {
    return this.page.getByRole('link', { name: /^electronics$/i }).first();
  }
 
  get electronicsCategoryHeader(): Locator {
    return this.page.getByRole('heading', { name: /electronics/i }).first();
  }
 
  // ==================== Search Result Locators ====================
 
  get searchResultHeader(): Locator {
    // Must target the whole heading/container: the result count and the
    // search term ("wireless headphones") live in separate child spans.
    return this.page
      .getByRole('heading', { name: /results for/i })
      .or(this.page.locator('[data-component-type="s-messaging-container-results-count"]'))
      .first();
  }
 
  get firstSearchResultCard(): Locator {
    // No accessible role/label exists for result cards, so the stable
    // data attribute is the best available hook.
    return this.page.locator('[data-component-type="s-search-result"]').first();
  }
 
  // ==================== Actions ====================
 
  /**
   * Verifies the core home page layout elements are visible.
   * @returns {Promise<void>}
   */
  async verifyHomePageElements(): Promise<void> {
    await expect(this.amazonLogo).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchSubmitButton).toBeVisible();
    await expect(this.cartButton).toBeVisible();
  }
 
  /**
   * Clicks the Electronics link in the top navigation bar.
   * @returns {Promise<void>}
   */
  async navigateToElectronicsCategory(): Promise<void> {
    await expect(this.topNavElectronicsLink).toBeVisible({ timeout: 10000 });
    await this.topNavElectronicsLink.click({ force: true });
  }
 
  /**
   * Captures a screenshot and attaches it to the running test so it
   * renders inside the HTML report.
   * @param {string} filename - Attachment name shown in the report.
   * @param {{ fullPage: boolean }} options - Screenshot options.
   * @returns {Promise<void>}
   */
  async captureScreenshot(filename: string, options: { fullPage: boolean }): Promise<void> {
    const screenshotBuffer = await this.page.screenshot({
      fullPage: options.fullPage,
    });
 
    await test.info().attach(filename, {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  }
}