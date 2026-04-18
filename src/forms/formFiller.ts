import { Page } from "puppeteer";
import { typeText, selectDropdown, clickElement } from "../utils/actions.utils";
import { FormField } from "../types/form.types";
import { retry } from "../utils/retry";
import { isDropdown, normalizeValue } from "../utils/field.utils";

/**
 * Fills provided form fields using actions (type, select, click).
 * Throws error if a value was not set as expected.
 */
export async function fillFields(page: Page, fields: FormField[]) {
  for (const field of fields) {
    const { fieldName, selector, action, value } = field;
    await page.waitForSelector(selector);
    
    // Await for Promise returned by isDropdown
    const dropdown = action === "select" || (await isDropdown(fieldName, selector));
    if (dropdown) {
      if (typeof value !== "string") {
        throw new Error(`Field "${fieldName}" requires string value`);
      }

      const normValue = await normalizeValue(fieldName, value);

      // Set dropdown value
      await retry(() => selectDropdown(page, selector, normValue));

      // Check the dropdown value is set correctly
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

      // Type the input value
      await retry(() => typeText(page, selector, normValue));

      // Check the input value is set correctly
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
      // Click the element
      await clickElement(page, selector);
    } else {
      // Unknown action, continue to next field
      continue;
    }
  }
}
