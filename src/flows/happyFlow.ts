import { Page } from "puppeteer";

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
  assertBagHasItems
} from "../navigation";
import {
  fillInitialAddressForm,
  fillPostAddressForm,
  clickContinue,
  clickFindAddress,
  selectAddressFromResults,
} from "../formFiller";
import { runStep } from "../utils";
import { selectors } from "../selectors";

const PRODUCT_URL = "https://www.freemans.com/products/bonprix-stripe-short-sleeve-blouse/_/A-913221_8";

// Main happy path test runner for a successful guest purchase flow
export async function runHappyFlow(page: Page) {
  // Homepage visit and consent flow
  await runStep("GO_TO_HOMEPAGE", () => goToHomepage(page));
  await runStep("ACCEPT_COOKIES", () => acceptCookies(page));

  // Product selection and adding to bag
  await runStep("GO_TO_PRODUCT", () => goToProduct(page, PRODUCT_URL));
  await runStep("SELECT_COLOR", () => selectColor(page));
  await runStep("SELECT_SIZE", () => selectSize(page));
  await runStep("ADD_TO_BAG", () => addToBag(page));

  // Ensure item is in bag, then navigate to bag
  await runStep("ASSERT_BAG", () => assertBagHasItems(page));
  await runStep("GO_TO_BAG", () => goToBag(page));

  // Move to checkout; waits for login page
  await runStep(
    "GO_TO_CHECKOUT",
    () => goToCheckout(page),
    async () => {
      const url = page.url();
      return url.includes("co_login");
    }
  );

  // Guest checkout, waiting for personal details step
  await runStep(
    "GUEST_CHECKOUT",
    () => goToGuestCheckout(page),
    async () => {
      const url = page.url();
      return url.includes("co_personal_details");
    }
  );

  // Guest address entry and selection
  await runStep("FILL_INITIAL_FORM", () => fillInitialAddressForm(page));
  await runStep("FIND_ADDRESS", () => clickFindAddress(page));
  await runStep("SELECT_ADDRESS", () => selectAddressFromResults(page));
  await runStep("FILL_POST_FORM", () => fillPostAddressForm(page));
  await runStep("CONTINUE", () => clickContinue(page));

  // Delivery stage; waits for payment container to appear
  await runStep(
    "DELIVERY",
    () => continueDelivery(page),
    async () => {
      return await page.$(selectors.confirmPayContainer) !== null;
    }
  );

  // Choose pay now, wait for card details panel
  await runStep(
    "PAY_NOW",
    () => choosePayNow(page),
    async () => {
      return await page.$(selectors.cardDetailsContainer) !== null;
    }
  );

  // Fill in card details and check payment readiness
  await runStep("FILL_CARD", () => fillCardDetails(page));
  await runStep("CHECK_PAYMENT", () => purchaseAvailable(page));
}