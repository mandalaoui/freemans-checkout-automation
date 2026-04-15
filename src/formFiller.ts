import { Page } from "puppeteer";
import { initDb, getFormFields } from "./db";
import { typeText, selectDropdown, clickElement } from "./actions";
import { FormField } from "./types";
import { selectors } from "./selectors";

function isDropdown(fieldName: string, selector: string) {
  return (
    fieldName === "title" ||
    fieldName === "day" ||
    fieldName === "month" ||
    fieldName === "year" ||
    selector.includes("dob_")
  );
}

async function fillFields(page: Page, fields: FormField[]) {
  for (const field of fields) {
    const { fieldName, selector, action, value } = field;

    await page.waitForSelector(selector, { visible: true, timeout: 10000 });

    if (action === "select" || isDropdown(fieldName, selector)) {
      if (typeof value === "string") {
        await selectDropdown(page, selector, value);
      } else {
        throw new Error(
          `Field "${fieldName}" with action "select" or dropdown requires a string value.`
        );
      }
    } else if (action === "type") {
      if (typeof value === "string") {
        await typeText(page, selector, value);
      } else {
        throw new Error(
          `Field "${fieldName}" with action "type" requires a string value.`
        );
      }
    } else if (action === "click") {
      await clickElement(page, selector);
    }

    console.log(`Filled field: ${fieldName} -> ${selector}`);
  }
}

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
  console.log("Initial address form filled");
}

export async function clickFindAddress(page: Page) {
  await page.waitForSelector(selectors.findAddressButton, {
    visible: true,
    timeout: 10000,
  });

  await page.click(selectors.findAddressButton);

  await page.waitForSelector(selectors.addressSelect, {
    visible: true,
    timeout: 10000,
  });

  console.log("Find Address clicked and address list appeared");
}

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

  await page.select(selectors.addressSelect, valueToSelect);

  console.log(`Selected address: ${valueToSelect}`);

  await page.waitForSelector(selectors.email, {
    visible: true,
    timeout: 15000,
  });

  console.log("Address confirmed, next form revealed");
}

export async function fillPostAddressForm(page: Page) {
  const allFields: FormField[] = await getFormFields();
  const postFields = allFields.filter(f =>
    [
      "email",
      "confirmEmail",
      "password",
      "confirmPassword",
    ].includes(f.fieldName)
  );

  await fillFields(page, postFields);
  console.log("Post-address form filled");
}

export async function clickContinue(page: Page) {
  await clickElement(page, selectors.applyButton);
  console.log("Continue clicked");
}