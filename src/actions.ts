import { Page } from "puppeteer";

/**
 * Scrolls the element matching the selector into view (centered in viewport).
 */
async function scrollIntoView(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.scrollIntoView({ block: "center" });
    }
  }, selector);
}

/**
 * Types text into an input element. Ensures it's cleared before entering new text.
 * Throws an error if the selector is not found or input cannot be cleared.
 */
export async function typeText(page: Page, selector: string, text: string) {
  const element = await page.waitForSelector(selector, { visible: true });
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  await scrollIntoView(page, selector);

  // Clear the input before typing.
  await element.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  const cleared = await page.$eval(
    selector,
    (el: any) => (el as HTMLInputElement).value ?? ""
  );

  if (cleared !== "") {
    throw new Error(`Failed to clear input: ${selector}`);
  }

  // Type the new text.
  await element.type(text);
}

/**
 * Clicks an element, with options for waiting for navigation or a new selector.
 */
export async function clickElement(
  page: Page,
  selector: string,
  options?: {
    waitForNavigation?: boolean;
    waitForSelectorAfter?: string;
  }
) {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await scrollIntoView(page, selector);

  if (options?.waitForNavigation) {
    const urlBefore = page.url();
    await page.click(selector);

    try {
      await page.waitForFunction(
        prev => window.location.href !== prev,
        { timeout: 10000 },
        urlBefore
      );
    } catch {
      // If no navigation was detected (e.g., SPA), continue.
    }
  } else {
    await page.click(selector);
  }

  if (options?.waitForSelectorAfter) {
    await page.waitForSelector(options.waitForSelectorAfter, { timeout: 10000 });
  }
}

/**
 * Selects an option from a dropdown and validates it was set properly.
 */
export async function selectDropdown(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.select(selector, value);

  const actual = await page.$eval(
    selector,
    el => (el as HTMLSelectElement).value
  );

  if (actual !== value) {
    throw new Error(`Dropdown not set correctly: expected ${value}, got ${actual}`);
  }
}

/**
 * Sets a checkbox or radio button to the desired state.
 */
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
    await element.click();
  }
}

/**
 * Evaluates a function on the element specified by the selector.
 */
export async function evaluateOnSelector<T>(
  page: Page,
  selector: string,
  fn: (el: Element) => T
): Promise<T> {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  return page.$eval(selector, fn);
}
