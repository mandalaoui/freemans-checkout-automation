import { Page } from "puppeteer";

import { goToHomepage,
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

const PRODUCT_URL = "https://www.freemans.com/products/bonprix-stripe-short-sleeve-blouse/_/A-913221_8";

export async function runHappyFlow (page: Page) {
    await runStep("GO_TO_HOMEPAGE", () => goToHomepage(page));
    await runStep("ACCEPT_COOKIES", () => acceptCookies(page));

    await runStep("GO_TO_PRODUCT", () => goToProduct(page, PRODUCT_URL));
    await runStep("SELECT_COLOR", () => selectColor(page));
    await runStep("SELECT_SIZE", () => selectSize(page));
    await runStep("ADD_TO_BAG", () => addToBag(page));

    await runStep("ASSERT_BAG", () => assertBagHasItems(page));
    await runStep("GO_TO_BAG", () => goToBag(page));

    await runStep("GO_TO_CHECKOUT", () => goToCheckout(page));
    await runStep("GUEST_CHECKOUT", () => goToGuestCheckout(page));

    await runStep("FILL_INITIAL_FORM", () => fillInitialAddressForm(page));
    await runStep("FIND_ADDRESS", () => clickFindAddress(page));
    await runStep("SELECT_ADDRESS", () => selectAddressFromResults(page));
    await runStep("FILL_POST_FORM", () => fillPostAddressForm(page));
    await runStep("CONTINUE", () => clickContinue(page));

    await runStep("DELIVERY", () => continueDelivery(page));
    await runStep("PAY_NOW", () => choosePayNow(page));

    await runStep("FILL_CARD", () => fillCardDetails(page));
    await runStep("CHECK_PAYMENT", () => purchaseAvailable(page));
}