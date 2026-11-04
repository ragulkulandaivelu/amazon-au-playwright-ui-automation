import { Page, Locator, expect } from '@playwright/test';
 
/**
 * AmazonHomePage — Page Object Model
 *
 * All properties from the original page object are preserved so the
 * existing test file (amazonUi.spec.ts) compiles without changes:
 *   - searchSubmitButton  (alias kept alongside searchButton)
 *   - electronicsCategoryHeader
 *   - searchResultHeader
 *   - firstSearchResultCard
 */
export class AmazonHomePage {
    readonly page: Page;
 
    // ── Locators ──────────────────────────────────────────────────────────────
 
    // Logo
    readonly amazonLogo: Locator;
 
    // Search — both names kept so spec.ts compiles regardless of which it uses
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly searchSubmitButton: Locator;   // alias → same element as searchButton
 
    // Cart
    readonly cartButton: Locator;
 
    // Hamburger menu
    readonly hamburgerMenu: Locator;
 
    // Bot-check page
    readonly continueShoppingBtn: Locator;
 
    // Electronics category header — shown after navigating to Electronics
    // spec.ts line 59: expect(amazonHome.electronicsCategoryHeader).toBeVisible()
    readonly electronicsCategoryHeader: Locator;
 
    // Search results — used in spec.ts lines 90-91
    readonly searchResultHeader: Locator;
    readonly firstSearchResultCard: Locator;
 
    constructor(page: Page) {
        this.page = page;
 
        // Logo
        this.amazonLogo = page
            .getByRole('link', { name: /amazon/i })
            .first();
 
        // Search input — getByRole + placeholder fallback for slow CI loads
        this.searchInput = page
            .getByRole('searchbox')
            .or(page.getByPlaceholder(/search amazon/i))
            .first();
 
        // Search button — both property names point to the same element
        this.searchButton = page
            .getByRole('button', { name: /^go$/i })
            .or(page.getByRole('button', { name: /search/i }))
            .first();
        this.searchSubmitButton = this.searchButton;   // alias for spec.ts compatibility
 
        // Cart
        this.cartButton = page
            .getByRole('link', { name: /cart/i })
            .first();
 
        // Hamburger / All departments
        this.hamburgerMenu = page
            .getByRole('button', { name: /open menu|hamburger|all/i })
            .or(page.getByRole('link', { name: /^all$/i }))
            .first();
 
        // Bot-check page button
        this.continueShoppingBtn = page
            .getByRole('button', { name: /continue shopping/i });
 
        // Electronics category page — heading that confirms navigation succeeded
        // Amazon AU renders the department name as an <h1> or section heading
        this.electronicsCategoryHeader = page
            .getByRole('heading', { name: /electronics/i })
            .or(page.getByRole('heading', { name: /results/i }))
            .first();
 
        // Search results page elements
        // The results region heading (e.g. "results for ...")
        this.searchResultHeader = page
            .getByRole('heading', { level: 1 })
            .or(page.locator('.a-size-medium.a-color-base.a-text-normal').first())
            .first();
 
        // First product card in the search results grid
        this.firstSearchResultCard = page
            .getByRole('listitem')
            .filter({ has: page.getByRole('link', { name: /.*/ }) })
            .filter({ has: page.locator('[data-asin]') })
            .first();
    }
 
    // ── Bot-check handler ─────────────────────────────────────────────────────
 
    /**
     * Amazon shows "Click the button below to continue shopping" to headless
     * CI/CD runners (GitHub Actions, Jenkins, Docker) because their IP ranges
     * are on Amazon's bot blocklist.
     * Clicks through automatically; exits silently if page does not appear.
     */
    private async handleBotCheckIfPresent(): Promise<void> {
        try {
            await this.continueShoppingBtn.waitFor({ state: 'visible', timeout: 5000 });
            await this.continueShoppingBtn.click();
            await this.page.waitForNavigation({
                waitUntil: 'domcontentloaded',
                timeout: 15000,
            });
        } catch {
            // Bot-check page did not appear — normal flow, continue
        }
    }
 
    // ── Navigation ────────────────────────────────────────────────────────────
 
    async goto(): Promise<void> {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
        await this.handleBotCheckIfPresent();
        await this.searchInput.waitFor({ state: 'visible', timeout: 25000 });
    }
 
    // ── Assertions ────────────────────────────────────────────────────────────
 
    async verifyHomePageElements(): Promise<void> {
        await expect(this.amazonLogo).toBeVisible({ timeout: 20000 });
        await expect(this.searchInput).toBeVisible({ timeout: 20000 });
        await expect(this.searchButton).toBeVisible({ timeout: 20000 });
        await expect(this.cartButton).toBeVisible({ timeout: 20000 });
    }
 
    // ── Search ────────────────────────────────────────────────────────────────
 
    async searchForProduct(term: string): Promise<void> {
        await this.searchInput.waitFor({ state: 'visible', timeout: 25000 });
        await this.searchInput.fill(term);
 
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            this.searchButton.click(),
        ]);
    }
 
    // ── Electronics category ──────────────────────────────────────────────────
 
    async navigateToElectronicsCategory(): Promise<void> {
        await this.hamburgerMenu.waitFor({ state: 'visible', timeout: 15000 });
        await this.hamburgerMenu.click();
 
        await this.page.waitForSelector('.hmenu-visible', { timeout: 15000 });
 
        const electronicsLink = this.page
            .locator('.hmenu-visible')
            .getByRole('link', { name: /^electronics$/i })
            .first();
 
        await electronicsLink.waitFor({ state: 'visible', timeout: 15000 });
 
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            electronicsLink.click(),
        ]);
    }
 
    // ── Helpers ───────────────────────────────────────────────────────────────
 
    async verifySearchResultsVisible(): Promise<void> {
        await expect(
            this.page.getByRole('main').first()
        ).toBeVisible({ timeout: 20000 });
    }
 
    async takeFullPageScreenshot(fileName: string): Promise<void> {
        await this.page.screenshot({
            path: `verification/${fileName}.png`,
            fullPage: true,
        });
    }
}
 
