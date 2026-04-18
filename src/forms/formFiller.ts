import { Page } from "puppeteer";
import { typeText, selectDropdown, clickElement } from "../utils/actions.utils";
import { FormField } from "../types/form.types";
import { retry } from "../utils/retry";
import { isDropdown, normalizeValue } from "../utils/field.utils";

/**
 * Throws if a value is not set as expected, to prevent silent test failures.
 */
export async function fillFields(page: Page, fields: FormField[]) {
  for (const field of fields) {
    const { fieldName, selector, action, value } = field;
    await page.waitForSelector(selector);
    
    // Detecting dropdown via action or best-guess helper
    const dropdown = action === "select" || (await isDropdown(fieldName, selector));
    if (dropdown) {
      if (typeof value !== "string") {
        throw new Error(`Field "${fieldName}" requires string value`);
      }

      const normValue = await normalizeValue(fieldName, value);

      await retry(() => selectDropdown(page, selector, normValue));

      // Sanity check in case dropdown selection silently fails in the browser
      const actual = await page.$eval(
        selector,
        el => (el as HTMLSelectElement).value
      );
      if (actual !== normValue) {
        throw new Error(`Dropdown ${fieldName} not selected correctly`);
      }
    } else if (action === "type") {
      if (typeof value !== "string") {
        throw new Error(`Field "${fieldName}" requires string value`);
      }

      const normValue = await normalizeValue(fieldName, value);

      await retry(() => typeText(page, selector, normValue));

      // Defensive: browsers occasionally fail to set values as expected
      const actual = await page.$eval(
        selector,
        el => (el as HTMLInputElement).value
      );
      const normActual = await normalizeValue(fieldName, actual);
      const normExpected = await normalizeValue(fieldName, value);

      if (!actual || normActual !== normExpected) {
        throw new Error(`Field ${fieldName} not filled correctly`);
      }
    } else if (action === "click") {
      await clickElement(page, selector);
    } else {
      continue;
    }
  }
}
