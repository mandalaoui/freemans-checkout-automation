import { Page } from "puppeteer";
import { getFormFields } from "./db";
import { typeText, selectDropdown, clickElement } from "./actions";
import { FormField } from "./types";
import { selectors } from "./selectors";
import { retry } from "./utils";

// Helper to identify dropdown fields based on field name or selector pattern
function isDropdown(fieldName: string, selector: string) {
  return (
    fieldName === "title" ||
    fieldName === "day" ||
    fieldName === "month" ||
    fieldName === "year" ||
    selector.includes("dob_")
  );
}

// Normalize input values for specific fields (e.g., remove spaces from card numbers)
function normalizeValue(fieldName: string, value: string) {
  if (fieldName === "cardNumber") {
    return value.replace(/\s+/g, "");
  }
  return value.trim();
}

/**
 * Fills provided form fields using actions (type, select, click). 
 * Throws error if a value was not set as expected.
 */
export async function fillFields(page: Page, fields: FormField[]) {
  for (const field of fields) {
    const { fieldName, selector, action, value } = field;
    await page.waitForSelector(selector, { visible: true, timeout: 10000 });

    if (action === "select" || isDropdown(fieldName, selector)) {
      if (typeof value !== "string") {
        throw new Error(`Field "${fieldName}" requires string value`);
      }

      const normValue = normalizeValue(fieldName, value);

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

      const normValue = normalizeValue(fieldName, value);

      // Type the input value
      await retry(() => typeText(page, selector, normValue));

      // Check the input value is set correctly
      const actual = await page.$eval(
        selector,
        el => (el as HTMLInputElement).value
      );
      const normActual = normalizeValue(fieldName, actual);
      const normExpected = normalizeValue(fieldName, value);

      if (!actual || normActual !== normExpected) {
        throw new Error(`Field ${fieldName} not filled correctly`);
      }
    } else if (action === "click") {
      // Click the element
      await retry(() => clickElement(page, selector));
    } else {
      // Unknown action, continue to next field
      continue;
    }
  }
}

/**
 * Fill the initial address/customer details form and check for visible errors
 */
export async function fillInitialAddressForm(page: Page) {
  const allFields: FormField[] = await getFormFields();
  // Filter for only the initial details form fields
  const initialFields = allFields.filter(f =>
    [
      "title",
      "firstName",
      "lastName",
      "day",
      "month",
      "year",
      "phone",
      "house",
      "postcode",
    ].includes(f.fieldName)
  );

  await fillFields(page, initialFields);

  // Check the form for any visible error elements after filling
  const visibleErrors = await page.$$eval(".error", els =>
    els
      .filter(el => {
        const style = window.getComputedStyle(el);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          el.textContent?.trim()
        );
      })
      .map(el => el.textContent!.trim())
  );
  if (visibleErrors.length > 0) {
    throw new Error(`Form errors found: ${visibleErrors.join(", ")}`);
  }
}

/**
 * Click "Find Address" button and ensure address select options are loaded
 */
export async function clickFindAddress(page: Page) {
  await page.waitForSelector(selectors.findAddressButton, {
    visible: true,
    timeout: 10000,
  });

  await retry(() => clickElement(page, selectors.findAddressButton));

  await page.waitForSelector(selectors.addressSelect, {
    visible: true,
    timeout: 10000,
  });

  // Make sure at least one address option is loaded in the dropdown
  const optionsCount = await page.$$eval(
    `${selectors.addressSelect} option`,
    opts => opts.length
  );

  if (optionsCount === 0) {
    throw new Error("No address options loaded");
  }
}

/**
 * Select the first valid address option from the dropdown after lookup
 */
export async function selectAddressFromResults(page: Page) {
  await page.waitForSelector(selectors.addressSelect, {
    visible: true,
    timeout: 10000,
  });

  // Get all valid (non-placeholder) option values
  const options = await page.$$eval(`${selectors.addressSelect} option`, (opts) =>
    opts
      .map((o) => o.value)
      .filter((v) => v && v !== "Please select from the list")
  );

  if (!options.length) {
    throw new Error("No valid address options found");
  }

  const valueToSelect = options[0];

  await retry(() => selectDropdown(page, selectors.addressSelect, valueToSelect));

  // Ensure the value is selected
  const actual = await page.$eval(
    selectors.addressSelect,
    el => (el as HTMLSelectElement).value
  );

  if (actual !== valueToSelect) {
    throw new Error("Address not selected properly");
  }

  // Wait for the email input to load as a sign that form progressed
  await page.waitForSelector(selectors.email, {
    visible: true,
    timeout: 15000,
  });
}

/**
 * Fill post-address form fields and ensure validations (email/pass confirm) 
 */
export async function fillPostAddressForm(page: Page) {
  const allFields: FormField[] = await getFormFields();
  const fieldNames = ["email", "confirmEmail", "password", "confirmPassword"];
  const postFields = allFields.filter(f => fieldNames.includes(f.fieldName));

  // Validate that emails and passwords match
  const emailField = postFields.find(f => f.fieldName === "email");
  const confirmEmailField = postFields.find(f => f.fieldName === "confirmEmail");
  const passwordField = postFields.find(f => f.fieldName === "password");
  const confirmPasswordField = postFields.find(f => f.fieldName === "confirmPassword");

  if (emailField && confirmEmailField && emailField.value !== confirmEmailField.value) {
    throw new Error("Email and Confirm Email values do not match");
  }
  if (passwordField && confirmPasswordField && passwordField.value !== confirmPasswordField.value) {
    throw new Error("Password and Confirm Password values do not match");
  }

  await fillFields(page, postFields);
}

/**
 * Click the "Continue" or "Apply" button and wait for the next form container
 */
export async function clickContinue(page: Page) {
  await page.waitForSelector(selectors.applyButton, { visible: true });

  await retry(() => clickElement(page, selectors.applyButton));

  await page.waitForSelector(selectors.deliveryContainerWrapper, {
    timeout: 15000,
  });
}