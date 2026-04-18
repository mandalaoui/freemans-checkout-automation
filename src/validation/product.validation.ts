import { Page } from "puppeteer";
import { commonSelectors } from "../selectors/common.selectors";
import { selectors as productSelectors } from "../selectors/product.selectors";

export async function assertProductReady(page: Page) {
  await page.waitForSelector(productSelectors.productTitle, { visible: true });
  await page.waitForSelector(commonSelectors.bagButton, { visible: true });

  const hasSizes = await page.$$eval(
    "span.productOptionItem",
    els => els.length > 0
  );

  if (!hasSizes) {
    throw new Error("No sizes available on product page");
  }
}