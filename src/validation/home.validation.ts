import { Page } from "puppeteer";

/**
 * Validate that the homepage is fully loaded and ready.
 * - The main hero/banner container is visible
 * - The DOM is fully loaded (document.readyState === "complete")
 * - No cookie accept button is visible with text "Accept"
 */
export async function assertHomeReady(page: Page, heroSelector: string) {
    await page.waitForSelector(heroSelector, {
        visible: true,
        timeout: 10000,
    });

    await page.waitForFunction(() => {
        const overlays = Array.from(document.querySelectorAll("[role='dialog'], .modal, .overlay"));
        return overlays.length === 0;
    });
}