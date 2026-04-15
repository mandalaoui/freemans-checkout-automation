import { launchBrowser } from "./browser";
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
} from "./navigation";
import {
  fillInitialAddressForm,
  fillPostAddressForm,
  clickContinue,
  clickFindAddress,
  selectAddressFromResults,
} from "./formFiller";



async function run() {
  const { browser, page } = await launchBrowser();
  const productUrl = "https://www.freemans.com/products/bonprix-stripe-short-sleeve-blouse/_/A-913221_8";

  try {
    // home
    await goToHomepage(page);
    await acceptCookies(page);
    await goToProduct(page, productUrl);

    // product
    await selectColor(page);
    await selectSize(page);
    await addToBag(page);

    // bag
    await assertBagHasItems(page);
    await goToBag(page);
    
    // checkout
    await goToCheckout(page);
    await goToGuestCheckout(page);

    // register
    await fillInitialAddressForm(page);
    await clickFindAddress(page);
    await selectAddressFromResults(page);
    await fillPostAddressForm(page);
    await clickContinue(page);

    // delivery
    await continueDelivery(page);

    // payment
    await choosePayNow(page);
    await fillCardDetails(page);
    await purchaseAvailable(page);

    console.log("Flow finished successfully");
  } catch (error) {
    console.error("Automation error:", error);
  } finally {
    // await browser.close();
  }
}

run();