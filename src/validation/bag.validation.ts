import { Page } from "puppeteer";
import { selectors as bagSelectors } from "../selectors/bag.selectors";

// Assert that the bag is not empty by checking count and empty state
export async function assertHasItems(page: Page): Promise<void> {
    await page.waitForSelector(bagSelectors.xfoBagCount, { timeout: 10000 });

    const bagCount = await page.$eval(
      bagSelectors.xfoBagCount,
      el => el.textContent?.trim() ?? ""
    );

    const isEmptyStateVisible = await page.$(bagSelectors.emptyBagState);

    const countNum = parseInt(bagCount, 10);

    if (isNaN(countNum) || countNum <= 0 || isEmptyStateVisible) {
        throw new Error(`Bag is empty. Current bag count: ${bagCount}`);
    }
}

// Assert that the bag page is open by confirming checkout button is visible
export async function assertOpen(page: Page): Promise<void> {
    await page.waitForSelector(bagSelectors.checkoutButton, {
        visible: true,
    });
}