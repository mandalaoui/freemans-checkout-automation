import { Page } from "puppeteer";
import { commonSelectors } from "../selectors/common.selectors";

/**
 * Assert the final payment/apply button is enabled and interactable.
 * Throws if disabled.
 */
export async function assertPurchaseAvailable(page: Page): Promise<void> {
  // Inline selector matching PaymentPage pattern
  await page.waitForSelector(commonSelectors.applyButton, { visible: true });

  const isDisabled = await page.$eval(
    commonSelectors.applyButton,
    (btn: any) => {
      return (
        btn.disabled ||
        btn.getAttribute("aria-disabled") === "true" ||
        btn.classList.contains("disabled")
      );
    }
  );

  if (isDisabled) {
    throw new Error("❌ Payment button is disabled");
  }
}

export async function assertPayNowSelected(page: Page, selector: string) {
  const checked = await page.$eval(
    selector,
    el => (el as HTMLInputElement).checked
  );

  if (!checked) {
    throw new Error("❌ Pay Now is not selected");
  }
}

export async function assertCardDetailsVisible(page: Page, selector: string) {
  const visible = await page.waitForSelector(selector);

  if (!visible) {
    throw new Error("❌ Card details not visible");
  }
}