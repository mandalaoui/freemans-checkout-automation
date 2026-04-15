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

export async function runNoSizeFlow(page: Page) {
  await runStep("GO_TO_HOMEPAGE", () => goToHomepage(page));
  await runStep("ACCEPT_COOKIES", () => acceptCookies(page));
  await runStep("GO_TO_PRODUCT", () => goToProduct(page, PRODUCT_URL));
  await runStep("SELECT_COLOR", () => selectColor(page));
  // ❌ אין selectSize
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

  console.log("✔ Negative: error displayed →", errorText);
}

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

  // ❌ הכנסת postcode לא תקין
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

  console.log("✔ Negative: invalid postcode blocked");
}

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

  // ❌ mismatch
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

  console.log("✔ Negative: email mismatch detected →", errorText);
}

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

  // Now at payment details step
  // ❌ Invalid card number
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

  console.log("✔ Negative: invalid card blocked");
}

export async function runNegativeFlows(browser: Browser) {

  let context;
  let page;

  context = await browser.createBrowserContext();
  page = await context.newPage();
  await runNoSizeFlow(page);
  console.log("\n🎉 runNoSizeFlow TEST PASSED");
  await context.close();

  context = await browser.createBrowserContext ();
  page = await context.newPage();
  await runEmailMismatchFlow(page);
  console.log("\n🎉 runEmailMismatchFlow TEST PASSED");
  await context.close();

  context = await browser.createBrowserContext ();
  page = await context.newPage();
  await runInvalidCardFlow(page);
  console.log("\n🎉 runInvalidCardFlow TEST PASSED");
  await context.close();
}