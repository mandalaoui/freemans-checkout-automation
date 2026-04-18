import { Page } from "puppeteer";

import { runStep } from "../utils/actions.utils";
import { HomePage } from "../pages/Homepage";
import { ProductPage } from "../pages/ProductPage";
import { BagPage } from "../pages/BagPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { DeliveryPage } from "../pages/DeliveryPage";
import { PaymentPage } from "../pages/PaymentPage";
import { getFormFields } from "../db/db";
import { assertCardDetailsVisible, assertPayNowSelected, assertPurchaseAvailable } from "../validation/payment.validation";
import { selectors as paymentSelectors } from "../selectors/payment.selectors";

const PRODUCT_URL = "https://www.freemans.com/products/bonprix-stripe-short-sleeve-blouse/_/A-913221_8";

// Main happy path test runner for a successful guest purchase flow
export async function runHappyFlow(page: Page) {
  const homePage = new HomePage(page);
  const product = new ProductPage(page);
  const bagPage = new BagPage(page);
  const checkoutPage = new CheckoutPage(page);
  const deliveryPage = new DeliveryPage(page);
  const paymentPage = new PaymentPage(page);

  await runStep("GO_TO_HOMEPAGE", async () => {
    await homePage.load();
  });

  await runStep("GO_TO_PRODUCT", async () => {
    await product.open(PRODUCT_URL);
  });

  await runStep("SELECT_COLOR", async () => {
    await product.selectColor();
  });

  await runStep("SELECT_SIZE", async () => {
    await product.selectSize();
  });

  await runStep("ADD_TO_BAG", async () => {
    await product.addToBag();
  });

  await runStep("ASSERT_BAG", async () => {
    await product.assertAddedToBag();
  });

  await runStep("GO_TO_BAG", async () => {
    await bagPage.open();
  });

  await runStep("GO_TO_CHECKOUT", async () => {
    await bagPage.goToCheckout();
  });

  await runStep("GUEST_CHECKOUT", async () => {
    await checkoutPage.startGuestCheckout();
  });

  await runStep("FILL_INITIAL_FORM", async () => {
    await checkoutPage.fillInitialAddressForm();
  });

  await runStep("FIND_ADDRESS", async () => {
    await checkoutPage.clickFindAddress();
  });

  await runStep("SELECT_ADDRESS", async () => {
    await checkoutPage.selectAddressFromResults();
  });

  await runStep("FILL_POST_FORM", async () => {
    await checkoutPage.fillPostAddressForm();
  });

  await runStep("CONTINUE", async () => {
    await checkoutPage.clickContinue();
  });

  await runStep("CONTINUE_FROM_DELIVERY", async () => {
    await deliveryPage.continueFromDelivery();
  });

  await runStep(
    "SELECT_PAY_NOW",
    async () => {
      await paymentPage.selectPayNow();
    },
    async () => {
      await assertPayNowSelected(page, paymentSelectors.paymentPayNowInput);
      await assertCardDetailsVisible(page, paymentSelectors.cardDetailsContainer);
      return true;
    }
  );

  await runStep("FILL_PAYMENT_DETAILS", async () => {
    const allFields = await getFormFields();

    await paymentPage.fillPaymentDetails(
      allFields.filter(f =>
        ["cardName", "cardNumber", "expiry", "cvv"].includes(f.fieldName)
      )
    );
  });

  await runStep("ASSERT_PAYMENT_READY", async () => {
    await assertPurchaseAvailable(page);
  });
}