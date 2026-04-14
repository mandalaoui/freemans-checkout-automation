import { Page } from "puppeteer";

export async function typeText(page: Page, selector: string, text: string) {
  await page.waitForSelector(selector);
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, text);
}

export async function clickElement(page: Page, selector: string) {
  await page.waitForSelector(selector);
  await page.click(selector);
}