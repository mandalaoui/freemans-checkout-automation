import { Page } from "puppeteer";
import { getFormFields } from "./db";
import { typeText, selectDropdown, clickElement } from "./actions";
import { FormField } from "./types";
import { selectors } from "./selectors";
import { retry } from "./utils";

// Identify dropdown fields (supports common patterns for day/month/year/...)
function isDropdown(fieldName: string, selector: string) {
  return (
    fieldName === "title" ||
    fieldName === "day" ||
    fieldName === "month" ||
    fieldName === "year" ||
    selector.includes("dob_")
  );
}

function normalizeValue(fieldName: string, value: string) {
  if (fieldName === "cardNumber") {
    return value.replace(/\s+/g, "");
  }
  return value.trim();
}

// Fills provided form fields, using actions from ./actions (typeText, selectDropdown, clickElement) with added logs
export async function fillFields(page: Page, fields: FormField[]) {
  for (const field of fields) {
    const { fieldName, selector, action, value } = field;

    console.log(`🔎 Waiting for selector "${selector}" (field: "${fieldName}", action: "${action}")`);
    await page.waitForSelector(selector, { visible: true, timeout: 10000 });

    if (action === "select" || isDropdown(fieldName, selector)) {
      if (typeof value !== "string") {
        throw new Error(`Field "${fieldName}" requires string value`);
      }

      const normValue = normalizeValue(fieldName, value);

      console.log(`⬇️  Selecting value "${normValue}" in dropdown "${fieldName}" (${selector})`);
      await retry(() => selectDropdown(page, selector, normValue));

      // Ensure the dropdown value is set correctly
      const actual = await page.$eval(
        selector,
        el => (el as HTMLSelectElement).value
      );
      console.log(`✅ Dropdown "${fieldName}" expected: "${normValue}", actual: "${actual}"`);

      if (actual !== normValue) {
        console.error(`❌ Dropdown ${fieldName} not selected correctly (expected: "${normValue}", actual: "${actual}")`);
        throw new Error(`Dropdown ${fieldName} not selected correctly`);
      }
    } else if (action === "type") {
      if (typeof value !== "string") {
        throw new Error(`Field "${fieldName}" requires string value`);
      }

      const normValue = normalizeValue(fieldName, value);

      console.log(`⌨️  Typing value "${normValue}" into "${fieldName}" (${selector})`);
      await retry(() => typeText(page, selector, normValue));

      // Ensure the input value is set correctly
      const actual = await page.$eval(
        selector,
        el => (el as HTMLInputElement).value
      );
      console.log(`✅ Input "${fieldName}" expected: "${normValue}", actual: "${actual}"`);

      const normActual = normalizeValue(fieldName, actual);
      const normExpected = normalizeValue(fieldName, value);
      console.log(`🔍 Normalized compare → expected: "${normExpected}", actual: "${normActual}"`);


      if (!actual || normActual !== normExpected) {
        console.error(
          `❌ Field ${fieldName} not filled correctly (expected: "${value}", actual: "${actual}")`
        );
        throw new Error(`Field ${fieldName} not filled correctly`);
      }
    } else if (action === "click") {
      console.log(`🖱️  Clicking element for "${fieldName}" (${selector})`);
      await retry(() => clickElement(page, selector));
      console.log(`✅ Clicked "${fieldName}"`);
    } else {
      console.warn(`⚠️  Unknown action "${action}" for field "${fieldName}"`);
    }
  }
}

// Fill the initial address/customer details form
export async function fillInitialAddressForm(page: Page) {
  const allFields: FormField[] = await getFormFields();
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

  // Ensure no visible errors after filling
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
    console.error("❌ Visible form errors:", visibleErrors);
    throw new Error(`Form errors found: ${visibleErrors.join(", ")}`);
  }
}

// Click the "Find Address" button, check results are loaded
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

  const optionsCount = await page.$$eval(
    `${selectors.addressSelect} option`,
    opts => opts.length
  );

  if (optionsCount === 0) {
    throw new Error("No address options loaded");
  }
}

// Select the first valid address from the loaded dropdown results
export async function selectAddressFromResults(page: Page) {
  await page.waitForSelector(selectors.addressSelect, {
    visible: true,
    timeout: 10000,
  });

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

  const actual = await page.$eval(
    selectors.addressSelect,
    el => (el as HTMLSelectElement).value
  );

  if (actual !== valueToSelect) {
    throw new Error("Address not selected properly");
  }

  await page.waitForSelector(selectors.email, {
    visible: true,
    timeout: 15000,
  });
}

// Fill post-address form fields (email, password, etc.)
export async function fillPostAddressForm(page: Page) {
  const allFields: FormField[] = await getFormFields();
  const fieldNames = ["email", "confirmEmail", "password", "confirmPassword"];
  const postFields = allFields.filter(f => fieldNames.includes(f.fieldName));

  // Compare values for confirmEmail/email and confirmPassword/password
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

// Click the "Continue" or "Apply" button and wait for next page/container
export async function clickContinue(page: Page) {
  await page.waitForSelector(selectors.applyButton, { visible: true });

  await retry(() => clickElement(page, selectors.applyButton));

  await page.waitForSelector(selectors.deliveryContainerWrapper, {
    timeout: 15000,
  });
}