import { type Locator, type Page, expect, test } from '@playwright/test';

export class AmazonHomePage {
  readonly page: Page;
  readonly amazonLogo: Locator;
  readonly searchInput: Locator;
  readonly searchSubmitButton: Locator;
  readonly cartButton: Locator;
  readonly topNavElectronicsLink: Locator;
  readonly electronicsCategoryHeader: Locator;
  readonly searchResultHeader: Locator;
  readonly firstSearchResultCard: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Core Layout Components
    this.amazonLogo = page.locator('#nav-logo-sprites, #nav-logo').first();
    this.searchInput = page.locator('#twotabsearchtextbox');
    this.searchSubmitButton = page.locator('#nav-search-submit-button');
    this.cartButton = page.locator('#nav-cart');

    this.electronicsCategoryHeader = page.locator('#contentGrid_298457, h1, h2, .nav-category-header, [data-component-type="s-messaging-container-results-count"]').first();
    this.topNavElectronicsLink = page.getByRole('link', { name: /^electronics$/i }).first();

    // Search Component Result Elements
    this.searchResultHeader = page.locator('[data-component-type="s-messaging-container-results-count"], h1 .a-text-bold').first();
    this.firstSearchResultCard = page.locator('[data-component-type="s-search-result"]').first();
  }

  async verifyHomePageElements() {
    await expect(this.amazonLogo).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchSubmitButton).toBeVisible();
    await expect(this.cartButton).toBeVisible();
  }

  async navigateToElectronicsCategory() {
    await expect(this.topNavElectronicsLink).toBeVisible({ timeout: 10000 });
    await this.topNavElectronicsLink.click({ force: true });
  }

  /**
   * Flexible verification screenshot utility handler.
   * FIX: Attaches the screenshot dynamically to the test info block so it renders inside the HTML report.
   */
  async captureScreenshot(filename: string, options: { fullPage: boolean }) {
    // 1. Capture the image buffer directly into memory
    const screenshotBuffer = await this.page.screenshot({
      fullPage: options.fullPage,
    });

    // 2. Attach it to the current running test metadata with an image content type
    await test.info().attach(filename, {
      body: screenshotBuffer,
      contentType: 'image/png'
    });
  }
}
