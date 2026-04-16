import { Browser, Page } from "puppeteer";

import {
  goToHomepage,
  goToProduct,
  acceptCookies,
  selectSize,
  addToBag,
  goToBag,
  selectColor,
  goToCheckout,
  goToGuestCheckout,
  continueDelivery,
  choosePayNow,
  fillCardDetails,
  purchaseAvailable,
  assertBagHasItems,
} from "../navigation";
import {
  fillInitialAddressForm,
  fillPostAddressForm,
  clickContinue,
  clickFindAddress,
  selectAddressFromResults,
} from "../formFiller";
import { clickElement, typeText } from "../actions";
import { runStep } from "../utils";
import { selectors } from "../selectors";

const PRODUCT_URL =
  "https://www.freemans.com/products/bonprix-stripe-short-sleeve-blouse/_/A-913221_8";

// This test attempts to add a product to the bag without choosing a size. It should show an error.
export async function runNoSizeFlow(page: Page) {
  await runStep("GO_TO_HOMEPAGE", () => goToHomepage(page));
  await runStep("ACCEPT_COOKIES", () => acceptCookies(page));
  await runStep("GO_TO_PRODUCT", () => goToProduct(page, PRODUCT_URL));
  await runStep("SELECT_COLOR", () => selectColor(page));
  // Do not select size: we expect an error about size selection
  await runStep("CLICK_ADD_TO_BAG", async () => {
    await clickElement(page, selectors.addToBagButton);
  });
  const errorText = await page.$eval(
    ".optionErrorMessage span",
    el => el.textContent?.trim()
  ).catch(() => null);

  if (!errorText) {
    throw new Error("Expected error when adding without size");
  }
}

// This test enters an invalid postcode and expects an error message.
export async function runInvalidPostcodeFlow(page: Page) {
  await runStep("GO_TO_HOMEPAGE", () => goToHomepage(page));
  await runStep("ACCEPT_COOKIES", () => acceptCookies(page));
  await runStep("GO_TO_PRODUCT", () => goToProduct(page, PRODUCT_URL));
  await runStep("SELECT_COLOR", () => selectColor(page));
  await runStep("SELECT_SIZE", () => selectSize(page));
  await runStep("ADD_TO_BAG", () => addToBag(page));
  await runStep("GO_TO_BAG", () => goToBag(page));
  await runStep("GO_TO_CHECKOUT", () => goToCheckout(page));
  await runStep("GUEST_CHECKOUT", () => goToGuestCheckout(page));

  // Submit invalid postcode in address form and expect validation error
  await runStep("FILL_INITIAL_FORM", () => fillInitialAddressForm(page));
  await runStep("TYPE_INVALID_POSTCODE", () => typeText(page, "#postCode", "INVALID"));
  await runStep("CLICK_FIND_ADDRESS", async () => {
    await clickElement(page, selectors.findAddressButton);
  });

  const errorText = await page.$eval(
    "#initialPostCodeValidation",
    el => el.textContent?.trim()
  ).catch(() => null);

  if (!errorText) {
    throw new Error("Expected postcode error");
  }
}

// This test submits mismatched emails and expects a validation error.
export async function runEmailMismatchFlow(page: Page) {
  await runStep("GO_TO_HOMEPAGE", () => goToHomepage(page));
  await runStep("ACCEPT_COOKIES", () => acceptCookies(page));
  await runStep("GO_TO_PRODUCT", () => goToProduct(page, PRODUCT_URL));
  await runStep("SELECT_COLOR", () => selectColor(page));
  await runStep("SELECT_SIZE", () => selectSize(page));
  await runStep("ADD_TO_BAG", () => addToBag(page));
  await runStep("GO_TO_BAG", () => goToBag(page));
  await runStep("GO_TO_CHECKOUT", () => goToCheckout(page));
  await runStep("GUEST_CHECKOUT", () => goToGuestCheckout(page));
  await runStep("FILL_INITIAL_FORM", () => fillInitialAddressForm(page));
  await runStep("FIND_ADDRESS", () => clickFindAddress(page));
  await runStep("SELECT_ADDRESS", () => selectAddressFromResults(page));

  // Enter differing email and confirm email fields
  await runStep("TYPE_EMAIL", () => typeText(page, "#Email", "test@example.com"));
  await runStep("TYPE_CONFIRM_EMAIL", () => typeText(page, "#ConfirmEmail", "wrong@example.com"));
  await runStep("CLICK_CONTINUE", async () => {
    await clickElement(page, selectors.applyButton);
  });

  const errorText = await page.$eval(
    "#ConfirmEmail-error, #emailValidation, .error",
    el => el.textContent?.trim()
  ).catch(() => null);

  if (!errorText) {
    throw new Error("Expected email mismatch error");
  }
}

// This test enters an invalid card number during payment and expects a validation error.
export async function runInvalidCardFlow(page: Page) {
  await runStep("GO_TO_HOMEPAGE", () => goToHomepage(page));
  await runStep("ACCEPT_COOKIES", () => acceptCookies(page));
  await runStep("GO_TO_PRODUCT", () => goToProduct(page, PRODUCT_URL));
  await runStep("SELECT_COLOR", () => selectColor(page));
  await runStep("SELECT_SIZE", () => selectSize(page));
  await runStep("ADD_TO_BAG", () => addToBag(page));
  await runStep("GO_TO_BAG", () => goToBag(page));
  await runStep("GO_TO_CHECKOUT", () => goToCheckout(page));
  await runStep("GUEST_CHECKOUT", () => goToGuestCheckout(page));
  await runStep("FILL_INITIAL_FORM", () => fillInitialAddressForm(page));
  await runStep("FIND_ADDRESS", () => clickFindAddress(page));
  await runStep("SELECT_ADDRESS", () => selectAddressFromResults(page));
  await runStep("FILL_POST_FORM", () => fillPostAddressForm(page));
  await runStep("CLICK_CONTINUE", () => clickContinue(page));
  await runStep("DELIVERY", () => continueDelivery(page));
  await runStep("PAY_NOW", () => choosePayNow(page));

  // Provide deliberately invalid card details and expect error
  await runStep("TYPE_INVALID_CARD", async () => {
    await typeText(page, "#CardHolderName", "Test User");
    await typeText(page, "#CardNumber", "123"); // Invalid card number
    await typeText(page, "#ExpiryDateMonthYear", "12/34");
    await typeText(page, "#CardSecurityCode", "123");
  });
  await runStep("CHECK_PAYMENT", () => purchaseAvailable(page));

  const error = await page.$(".error");

  if (!error) {
    throw new Error("Expected invalid card error");
  }
}

// Runs all negative test flows using new browser contexts for isolation
export async function runNegativeFlows(browser: Browser) {
  // Run no size flow
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runNoSizeFlow(page);
    await context.close();
  }
  // Run invalid postcode flow
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runInvalidPostcodeFlow(page);
    await context.close();
  }
  // Run email mismatch flow
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runEmailMismatchFlow(page);
    await context.close();
  }
  // Run invalid card flow
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runInvalidCardFlow(page);
    await context.close();
  }
}