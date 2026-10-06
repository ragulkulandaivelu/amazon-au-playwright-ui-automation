import { type Locator, type Page, expect } from '@playwright/test';

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

    // Horizontal Top Navigation Menu
    // OPTIMIZATION: Bounded the text lookup exclusively inside the nav-main header zones to prevent matching loose panel links
    //this.topNavElectronicsLink = page.locator('#nav-xshop a, #nav-subnav a, #nav-navbar-carousel a, #nav-main .nav-a').filter({ hasText: /^electronics\$/i }).first();
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
   * @param filename - Target string destination filename.
   * @param options - Dynamic runtime options controlling the capture canvas depth.
   */
  async captureScreenshot(filename: string, options: { fullPage: boolean }) {
    await this.page.screenshot({
      path: `verification/${filename}`,
      fullPage: options.fullPage, // Toggles true/false cleanly based on test instructions
    });
  }
}
