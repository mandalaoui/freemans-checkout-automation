import { Page } from "puppeteer";
import { retry } from "./retry";
import { logStep, logSuccess, logError } from "./logger";
import { getFormFields } from "../db/db";
import { seed } from "../db/seedDb";

async function scrollIntoView(page: Page, selector: string) {
    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
            el.scrollIntoView({ block: "center" });
        }
    }, selector);
}

// Ensures input is cleared before typing to prevent leftover/garbled values
// Throws if input cannot be cleared, preventing silent clobbering
export async function typeText(page: Page, selector: string, text: string) {
    const element = await page.waitForSelector(selector);
    if (!element) {
        throw new Error(`Element not found for selector: ${selector}`);
    }
    await scrollIntoView(page, selector);

    await element.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    const cleared = await page.$eval(
        selector,
        (el: any) => (el as HTMLInputElement).value ?? ""
    );

    if (cleared !== "") {
        throw new Error(`Failed to clear input: ${selector}`);
    }

    await element.type(text);
}

// Allows explicit waits for navigation or for selectors after click,
// supporting both classic and SPA flows
export async function clickElement(
    page: Page,
    selector: string,
    options?: {
        waitForNavigation?: boolean;
        waitForSelectorAfter?: string;
    }
) {
    await page.waitForSelector(selector, { timeout: 10000 });
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
            // Do nothing if navigation not detected (SPA scenario)
        }
    } else {
        await page.click(selector);
    }

    if (options?.waitForSelectorAfter) {
        await page.waitForSelector(options.waitForSelectorAfter, { timeout: 10000 });
    }
}

// Checks that the dropdown value was set as expected, catching potential site failures or test flakiness
export async function selectDropdown(page: Page, selector: string, value: string) {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.select(selector, value);

    const actual = await page.$eval(
        selector,
        el => (el as HTMLSelectElement).value
    );

    if (actual !== value) {
        throw new Error(`Dropdown not set correctly: expected ${value}, got ${actual}`);
    }
}

// Triggers wrapper click when present to support custom-checkbox/radio implementations
export async function setCheckboxOrRadio(
    page: Page,
    selector: string,
    checked: boolean = true
  ) {
    await page.waitForSelector(selector);
  
    const isChecked = await page.$eval(
      selector,
      el => (el as HTMLInputElement).checked
    );
  
    if (isChecked !== checked) {
      await page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (!input) return;
  
        const wrapper = input.closest('.radio-wrapper') as HTMLElement;
        if (wrapper) {
          wrapper.click();
        } else {
          (input as HTMLElement).click();
        }
      }, selector);
    }
  }

// Used for convenience when encapsulating direct DOM logic under a selector
export async function evaluateOnSelector<T>(
    page: Page,
    selector: string,
    fn: (el: Element) => T
): Promise<T> {
    await page.waitForSelector(selector, { timeout: 10000 });
    return page.$eval(selector, fn);
}

// Retries user step on failure, logging status, and fails immediately if validation fails after attempt
export async function runStep(
    stepName: string,
    fn: () => Promise<void>,
    validate?: () => Promise<boolean>
) {
    await retry(
        async () => {
            logStep(stepName);
            await fn();

            if (validate) {
                const ok = await validate();
                if (!ok) {
                    logError(`${stepName} - Validation failed`);
                    throw new Error("Validation failed");
                }
            }
            logSuccess(`${stepName} - Step succeeded`);
        },
        3,
        500
    );
}

// Only seeds database if existing form fields are missing (idempotency)
export async function seedDbIfNeeded(): Promise<void> {
  try {
    const existing = await getFormFields();
    if (!Array.isArray(existing) || existing.length === 0) {
      await seed();
      if (process.env.DEBUG === "true") {
        console.log("Database seeded with form fields.");
      }
    }
  } catch (err) {
    console.error("Error verifying or seeding the database:", err);
    throw err;
  }
}