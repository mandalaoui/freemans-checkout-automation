import { Page } from "puppeteer";

async function scrollIntoView(page: Page, selector: string) {
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollIntoView({ block: "center" });
  }, selector);
}

export async function typeText(
  page: Page,
  selector: string,
  text: string
) {
  const element = await page.waitForSelector(selector, { visible: true });
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }

  await scrollIntoView(page, selector);

  await element.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await page.$eval(selector, (el) => {
    (el as HTMLInputElement).value = "";
  });

  await element.type(text);
}

export async function clickElement(
  page: Page,
  selector: string,
  options?: {
    waitForNavigation?: boolean;
    waitForSelectorAfter?: string;
  }
) {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });

  if (options?.waitForNavigation) {
    await Promise.all([
      page.click(selector),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
  } else {
    await scrollIntoView(page, selector);
    await page.click(selector);
  }

  if (options?.waitForSelectorAfter) {
    await page.waitForSelector(options.waitForSelectorAfter, { timeout: 10000 });
  }
}

export async function selectDropdown(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.select(selector, value);
}

export async function setCheckboxOrRadio(
  page: Page,
  selector: string,
  checked: boolean = true
) {
  const element = await page.waitForSelector(selector, { visible: true });
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  const isChecked = await page.$eval(
    selector,
    (el: any) => el.checked
  );
  if (isChecked !== checked) {
    await page.evaluate((sel, checked) => {
      const el = document.querySelector(sel) as HTMLInputElement;
      if (el) {
        el.checked = checked;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, selector, checked);
  }
}

export async function evaluateOnSelector<T>(
  page: Page,
  selector: string,
  fn: (el: Element) => T
): Promise<T> {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  return page.$eval(selector, fn);
}