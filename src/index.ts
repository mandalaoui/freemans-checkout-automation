import { launchBrowser } from "./browser";
import { goToHomepage, goToProduct, acceptCookies, selectSize, addToBag, goToBag, selectColor } from "./navigation";

async function run() {
  const { browser, page } = await launchBrowser();
  const productUrl = "https://www.freemans.com/products/bonprix-stripe-short-sleeve-blouse/_/A-913221_8?PFM_rsn=browse&PFM_ref=false&PFM_psp=own&PFM_pge=1&PFM_lpn=4";

  try {
    await goToHomepage(page);
    await acceptCookies(page);
    await goToProduct(page, productUrl);

    await selectColor(page);
    await selectSize(page);

    await addToBag(page);

    await goToBag(page);

    console.log("Flow finished successfully");
  } catch (error) {
    console.error("Automation error:", error);
  } finally {
    // בשלב הפיתוח נשאיר פתוח
    // await browser.close();
  }
}

run();