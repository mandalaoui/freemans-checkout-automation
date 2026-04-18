// validation/checkout.validation.ts
import { Page } from "puppeteer";

export async function assertCheckoutLoaded(page: Page, selector: string) {
    await page.waitForSelector(selector, {
        visible: true,
        timeout: 10000,
    });

    await page.waitForFunction(() => {
        return document.readyState === "complete";
    });
}