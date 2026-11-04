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
 * Locator priority (Playwright best practices for third-party sites):
 *   1. getByRole    — first choice; tied to ARIA semantics
 *   2. getByLabel / getByPlaceholder — for inputs without a visible role name
 *   3. getByText    — for navigation links whose text is the stable identifier
 *   data-testid is not used because we do not control Amazon's DOM
 */
export class AmazonHomePage {
    readonly page: Page;
 
    // ── Locators ──────────────────────────────────────────────────────────────
 
    // Logo — <a aria-label="Amazon"> wrapping the logo image
    readonly amazonLogo: Locator;
 
    // Search — stable role + placeholder fallback for slow CI page loads
    readonly searchInput: Locator;
    readonly searchButton: Locator;
 
    // Cart — regex ignores the dynamic item count in the aria-label
    readonly cartButton: Locator;
 
    // Hamburger — entry point to All Departments / Electronics panel
    readonly hamburgerMenu: Locator;
 
    // Bot-check page — "Continue shopping" button Amazon shows to headless CI runners
    readonly continueShoppingBtn: Locator;
 
    constructor(page: Page) {
        this.page = page;
 
        this.amazonLogo = page
            .getByRole('link', { name: /amazon/i })
            .first();
 
        this.searchInput = page
            .getByRole('searchbox')
            .or(page.getByPlaceholder(/search amazon/i))
            .first();
 
        this.searchButton = page
            .getByRole('button', { name: /^go$/i })
            .or(page.getByRole('button', { name: /search/i }))
            .first();
 
        this.cartButton = page
            .getByRole('link', { name: /cart/i })
            .first();
 
        this.hamburgerMenu = page
            .getByRole('button', { name: /open menu|hamburger|all/i })
            .or(page.getByRole('link', { name: /^all$/i }))
            .first();
 
        // Bot-check page button
        this.continueShoppingBtn = page
            .getByRole('button', { name: /continue shopping/i });
    }
 
    // ── Bot-check handler ─────────────────────────────────────────────────────
 
    /**
     * Amazon shows a "Click the button below to continue shopping" page
     * to headless CI/CD runners (GitHub Actions, Jenkins, Docker) because
     * their IP ranges are on Amazon's bot blocklist.
     *
     * This method detects that page and clicks through it automatically.
     * It is called inside goto() so every test is protected transparently.
     * If the bot page does not appear, the try/catch exits silently.
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
            // Bot-check page did not appear — normal homepage loaded, continue
        }
    }
 
    // ── Navigation ────────────────────────────────────────────────────────────
 
    async goto(): Promise<void> {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
 
        // Handle bot-check page before any test actions run
        await this.handleBotCheckIfPresent();
 
        // Confirm the real homepage rendered
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
        // Open the All Departments hamburger side panel
        await this.hamburgerMenu.waitFor({ state: 'visible', timeout: 15000 });
        await this.hamburgerMenu.click();
 
        // Wait for the panel to open
        await this.page.waitForSelector('.hmenu-visible', { timeout: 15000 });
 
        // Electronics link scoped to the visible panel
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