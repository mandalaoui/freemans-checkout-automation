import { Browser, Page } from "puppeteer";

import { runStep } from "../utils/actions.utils";
import { HomePage } from "../pages/Homepage";
import { ProductPage } from "../pages/ProductPage";
import { BagPage } from "../pages/BagPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { DeliveryPage } from "../pages/DeliveryPage";
import { PaymentPage } from "../pages/PaymentPage";
import { commonSelectors } from "../selectors/common.selectors";
import { selectors as checkoutSelectors } from "../selectors/checkout.selectors";

const PRODUCT_URL = "https://www.freemans.com/products/bonprix-stripe-short-sleeve-blouse/_/A-913221_8";

// This test attempts to add a product to the bag without choosing a size. It should show an error.
export async function runNoSizeFlow(page: Page) {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);

  await runStep("GO_TO_HOMEPAGE", async () => {
    await homePage.load();
  });

  await runStep("GO_TO_PRODUCT", async () => {
    await productPage.open(PRODUCT_URL);
  });

  await runStep("SELECT_COLOR", async () => {
    await productPage.selectColor();
  });

  // Do NOT select size
  await runStep("CLICK_ADD_TO_BAG", async () => {
    await page.evaluate(() => {
      const btn = document.querySelector("button.primary.bagButton");
      if (btn) (btn as HTMLElement).click();
    });
  });

  await runStep("ASSERT_ERROR", async () => {
    await page.waitForSelector(".optionErrorMessage", { timeout: 5000 });

    const errorText = await page.$eval(
      ".optionErrorMessage span",
      el => el.textContent?.trim()
    );

    if (!errorText) {
      throw new Error("Expected error when adding without size");
    }
  });
}

// This test enters an invalid postcode and expects an error message.
export async function runInvalidPostcodeFlow(page: Page) {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const bagPage = new BagPage(page);
  const checkoutPage = new CheckoutPage(page);

  await runStep("GO_TO_HOMEPAGE", async () => {
    await homePage.load();
  });

  await runStep("GO_TO_PRODUCT", async () => {
    await productPage.open(PRODUCT_URL);
  });

  await runStep("SELECT_COLOR", async () => {
    await productPage.selectColor();
  });

  await runStep("SELECT_SIZE", async () => {
    await productPage.selectSize();
  });

  await runStep("ADD_TO_BAG", async () => {
    await productPage.addToBag();
  });

  await runStep("ASSERT_BAG", async () => {
    await productPage.assertAddedToBag();
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

  // Submit invalid postcode
  await runStep("TYPE_INVALID_POSTCODE", async () => {
    await page.type("#postCode", "INVALID");
  });

  await runStep("CLICK_FIND_ADDRESS", async () => {
    await page.evaluate((selector) => {
      const btn = document.querySelector(selector);
      if (btn) (btn as HTMLElement).click();
    }, checkoutSelectors.findAddressButton);
  });

  await runStep("ASSERT_POSTCODE_ERROR", async () => {
    await page.waitForSelector("#initialPostCodeValidation", { timeout: 5000 });
  
    const errorText = await page.$eval(
      "#initialPostCodeValidation",
      el => el.textContent?.trim()
    );
  
    if (!errorText) {
      throw new Error("Expected postcode error");
    }
  });
}

// This test submits mismatched emails and expects a validation error.
export async function runEmailMismatchFlow(page: Page) {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const bagPage = new BagPage(page);
  const checkoutPage = new CheckoutPage(page);

  await runStep("GO_TO_HOMEPAGE", async () => {
    await homePage.load();
  });

  await runStep("GO_TO_PRODUCT", async () => {
    await productPage.open(PRODUCT_URL);
  });

  await runStep("SELECT_COLOR", async () => {
    await productPage.selectColor();
  });

  await runStep("SELECT_SIZE", async () => {
    await productPage.selectSize();
  });

  await runStep("ADD_TO_BAG", async () => {
    await productPage.addToBag();
  });

  await runStep("ASSERT_BAG", async () => {
    await productPage.assertAddedToBag();
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

  // Enter differing email and confirm email fields
  await runStep("TYPE_EMAIL", async () => {
    await page.type("#Email", "test@example.com");
  });
  await runStep("TYPE_CONFIRM_EMAIL", async () => {
    await page.type("#ConfirmEmail", "wrong@example.com");
  });
  await runStep("CLICK_CONTINUE", async () => {
    await page.click(commonSelectors.applyButton);
  });

  await page.click(commonSelectors.applyButton);

  await page.waitForSelector(
    "#ConfirmEmail-error, #emailValidation, .error",
    { timeout: 5000 }
  );

  const errorText = await page.$eval(
    "#ConfirmEmail-error, #emailValidation, .error",
    el => el.textContent?.trim()
  );

  if (!errorText) {
    throw new Error("Expected email mismatch error");
  }
}

// This test enters an invalid card number during payment and expects a validation error.
export async function runInvalidCardFlow(page: Page) {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const bagPage = new BagPage(page);
  const checkoutPage = new CheckoutPage(page);
  const deliveryPage = new DeliveryPage(page);
  const paymentPage = new PaymentPage(page);

  await runStep("GO_TO_HOMEPAGE", async () => {
    await homePage.load();
  });

  await runStep("GO_TO_PRODUCT", async () => {
    await productPage.open(PRODUCT_URL);
  });

  await runStep("SELECT_COLOR", async () => {
    await productPage.selectColor();
  });

  await runStep("SELECT_SIZE", async () => {
    await productPage.selectSize();
  });

  await runStep("ADD_TO_BAG", async () => {
    await productPage.addToBag();
  });

  await runStep("ASSERT_BAG", async () => {
    await productPage.assertAddedToBag();
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

  await runStep("SELECT_PAY_NOW", async () => {
    await paymentPage.selectPayNow();
  });

  // Provide deliberately invalid card details and expect error
  await runStep("TYPE_INVALID_CARD", async () => {
    await page.type("#CardHolderName", "Test User");
    await page.type("#CardNumber", "123");
    await page.type("#ExpiryDateMonthYear", "12/34");
    await page.type("#CardSecurityCode", "123");
  });

  await runStep("CLICK_PAY", async () => {
    await page.click(commonSelectors.applyButton);
  });

  await runStep("ASSERT_CARD_ERROR", async () => {
    await page.waitForSelector(".error", { timeout: 5000 });
  
    const errorText = await page.$eval(
      ".error",
      el => el.textContent?.trim()
    );
  
    if (!errorText) {
      throw new Error("Expected invalid card error");
    }
  });
}

// Runs all negative test flows using new browser contexts for isolation
export async function runNegativeFlows(browser: Browser) {
  // Run no size flow
  {
    if (process.env.DEBUG === "true") console.log("Running negative flow: no size selected");
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runNoSizeFlow(page);
    await context.close();
    if (process.env.DEBUG === "true") console.log("Finished negative flow: no size selected");
  }
  // Run invalid postcode flow
  {
    if (process.env.DEBUG === "true") console.log("Running negative flow: invalid postcode");
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runInvalidPostcodeFlow(page);
    // await context.close();
    if (process.env.DEBUG === "true") console.log("Finished negative flow: invalid postcode");
  }
  // Run email mismatch flow
  {
    if (process.env.DEBUG === "true") console.log("Running negative flow: email mismatch");
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runEmailMismatchFlow(page);
    await context.close();
    if (process.env.DEBUG === "true") console.log("Finished negative flow: email mismatch");
  }
  // Run invalid card flow
  {
    if (process.env.DEBUG === "true") console.log("Running negative flow: invalid card details");
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await runInvalidCardFlow(page);
    await context.close();
    if (process.env.DEBUG === "true") console.log("Finished negative flow: invalid card details");
  }
}