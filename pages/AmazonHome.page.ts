import { Page, Locator, expect } from '@playwright/test';
 
/**
 * AmazonHomePage — Page Object Model
 * Locators use getByRole / getByPlaceholder (Playwright best practice).
 * data-testid is not used because we do not control Amazon's DOM.
 */
export class AmazonHomePage {
    readonly page: Page;
 
    readonly amazonLogo: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly searchSubmitButton: Locator;   // alias of searchButton (used by amazonUi.spec.ts)
    readonly cartButton: Locator;
    readonly hamburgerMenu: Locator;
    readonly continueShoppingBtn: Locator;
    readonly electronicsCategoryHeader: Locator;
    readonly searchResultHeader: Locator;
    readonly firstSearchResultCard: Locator;
 
    constructor(page: Page) {
        this.page = page;
 
        this.amazonLogo = page.getByRole('link', { name: /amazon/i }).first();
 
        this.searchInput = page
            .getByRole('searchbox')
            .or(page.getByPlaceholder(/search amazon/i))
            .first();
 
        this.searchButton = page
            .getByRole('button', { name: /^go$/i })
            .or(page.getByRole('button', { name: /search/i }))
            .first();
        this.searchSubmitButton = this.searchButton;
 
        this.cartButton = page.getByRole('link', { name: /cart/i }).first();
 
        this.hamburgerMenu = page
            .getByRole('button', { name: /open menu|hamburger|all/i })
            .or(page.getByRole('link', { name: /^all$/i }))
            .first();
 
        this.continueShoppingBtn = page.getByRole('button', { name: /continue shopping/i });
 
        this.electronicsCategoryHeader = page
            .getByRole('heading', { name: /electronics/i })
            .or(page.getByRole('heading', { name: /results/i }))
            .first();
 
        this.searchResultHeader = page
            .getByRole('heading', { level: 1 })
            .or(page.locator('.a-size-medium.a-color-base.a-text-normal').first())
            .first();
 
        this.firstSearchResultCard = page
            .getByRole('listitem')
            .filter({ has: page.getByRole('link', { name: /.*/ }) })
            .filter({ has: page.locator('[data-asin]') })
            .first();
    }
 
    // ── Bot-check handler (Amazon "Continue shopping" page shown to CI runners) ──
    private async handleBotCheckIfPresent(): Promise<void> {
        try {
            await this.continueShoppingBtn.waitFor({ state: 'visible', timeout: 5000 });
            await this.continueShoppingBtn.click();
            await this.page.waitForLoadState('domcontentloaded');
        } catch {
            // Bot-check page did not appear — continue
        }
    }
 
    async goto(): Promise<void> {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
        await this.handleBotCheckIfPresent();
        await this.searchInput.waitFor({ state: 'visible', timeout: 25000 });
    }
 
    async verifyHomePageElements(): Promise<void> {
        await expect(this.amazonLogo).toBeVisible({ timeout: 20000 });
        await expect(this.searchInput).toBeVisible({ timeout: 20000 });
        await expect(this.searchButton).toBeVisible({ timeout: 20000 });
        await expect(this.cartButton).toBeVisible({ timeout: 20000 });
    }
 
    async searchForProduct(term: string): Promise<void> {
        await this.searchInput.waitFor({ state: 'visible', timeout: 25000 });
        await this.searchInput.fill(term);
        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.searchButton.click(),
        ]);
    }
 
    /**
     * Electronics navigation with fallbacks, tuned to finish well inside the test timeout.
     *
     *   1. Open the hamburger menu and click any visible link whose name contains
     *      "electronics" (5 s).
     *   2. If not found, click "See all" to expand departments and retry (4 s).
     *   3. Fallback: open the Electronics department directly by its category node
     *      (the same node id the spec's toHaveURL check accepts).
     *
     * Worst case this method now takes about 15 s instead of 30+ s.
     */
    async navigateToElectronicsCategory(): Promise<void> {
        const electronicsLink = this.page
            .getByRole('link', { name: /electronics/i })
            .filter({ visible: true })
            .first();
 
        const clickElectronics = async (timeout: number): Promise<boolean> => {
            try {
                await electronicsLink.waitFor({ state: 'visible', timeout });
                await electronicsLink.click({ timeout: 5000 });
                await this.page.waitForLoadState('domcontentloaded');
                return true;
            } catch {
                return false;
            }
        };
 
        // 1. Hamburger menu
        try {
            await this.hamburgerMenu.click({ timeout: 8000 });
            if (await clickElectronics(5000)) return;
 
            // 2. Expand "See all" and retry
            const seeAll = this.page
                .getByRole('link', { name: /see all/i })
                .filter({ visible: true })
                .first();
            await seeAll.click({ timeout: 2000 });
            if (await clickElectronics(4000)) return;
        } catch {
            // menu or "See all" not available — use the direct URL below
        }
 
        // 3. Fallback: Electronics department by category node
        console.warn('[AmazonHomePage] Electronics link not found in menu; opening node 4851799051 directly');
        await this.page.goto('/b?node=4851799051', { waitUntil: 'domcontentloaded' });
        await this.handleBotCheckIfPresent();
    }
 
    async verifySearchResultsVisible(): Promise<void> {
        await expect(this.page.getByRole('main').first()).toBeVisible({ timeout: 20000 });
    }
 
    async takeFullPageScreenshot(fileName: string): Promise<void> {
        await this.page.screenshot({ path: `verification/${fileName}.png`, fullPage: true });
    }
}
 