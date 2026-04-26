import { Page } from "puppeteer";
import { assertHasItems } from "../validation/bag.validation";
import { retry } from "../utils/retry";
import {
  clickElement,
  evaluateOnSelector,
} from "../utils/actions.utils";
import { assertProductReady } from "../validation/product.validation";
import { selectors as productSelectors } from "../selectors/product.selectors";

/**
 * Encapsulates product interaction flows to reduce UI flakiness and centralize key assertions.
 * Utility functions are used to avoid brittle direct DOM interaction.
 */
export class ProductPage {
  constructor(private page: Page) { }

  async open(productUrl: string): Promise<void> {
    await this.page.goto(productUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await assertProductReady(this.page);
  }

  async selectColor(): Promise<void> {
    await retry(async () => {
      await this.page.waitForSelector(productSelectors.colorButton, { visible: true, timeout: 10000 });

      const colorButtons = await this.page.$$(productSelectors.colorButton);
      if (!colorButtons.length) throw new Error("No colors");

      let selectedEl = null;

      for (const btn of colorButtons) {
        const isOutOfStock = await this.page.evaluate(el =>
          el.classList.contains("soldOutOption") ||
          el.closest(".circularOutOfStockOption") !== null,
          btn
        );

        if (!isOutOfStock) {
          selectedEl = btn;
          break;
        }
      }

      if (!selectedEl) throw new Error("No available colors");

      await this.page.evaluate(e => e.scrollIntoView({ block: "center" }), selectedEl);
      await selectedEl.click();

      await this.page.waitForFunction(
        el => el.classList.contains("selectedOption"),
        { timeout: 3000 },
        selectedEl
      );
    });
  }

  async selectSize(): Promise<void> {
    await retry(async () => {
      if (process.env.DEBUG === "true") console.log("[selectSize] Waiting for size buttons...");
      await this.page.waitForSelector(productSelectors.sizeButton, {
        visible: true,
        timeout: 10000,
      });

      const sizes = await this.page.$$(productSelectors.sizeButton);
      if (process.env.DEBUG === "true") console.log(`[selectSize] Found ${sizes.length} size buttons`);

      let selectedEl: any = null;

      for (const size of sizes) {
        const [isOutOfStock, isSize] = await this.page.evaluate(el => {
          const val = el.getAttribute("data-optionvalue") || "";
          const isOut = el.closest(".boxOptionOuter")?.classList.contains("circularOutOfStockOption") ?? false;
          const isSz = /^[0-9]/.test(val);
          return [isOut, isSz];
        }, size);

        if (!isOutOfStock && isSize) {
          selectedEl = size;
          break;
        }
      }

      if (!selectedEl) {
        console.error("[selectSize] No available sizes");
        throw new Error("No available sizes");
      }

      const value = await this.page.evaluate(
        el => el.getAttribute("data-optionvalue"),
        selectedEl
      );

      if (process.env.DEBUG === "true") console.log(`[selectSize] Selecting size: ${value}`);

      await this.page.evaluate(
        e => e.scrollIntoView({ block: "center" }),
        selectedEl
      );

      await selectedEl.click();

      if (process.env.DEBUG === "true") console.log(`[selectSize] Waiting for size to be marked as selected for value: ${value}`);

      // Wait for DOM to reflect selected state using stable selector instead of element handle
      await this.page.waitForSelector(
        `${productSelectors.sizeButton}.selectedOption[data-optionvalue="${value}"]`,
        { timeout: 3000 }
      );

      if (process.env.DEBUG === "true") console.log(`[selectSize] Size selected: ${value}`);
    });
  }

  async addToBag(): Promise<void> {
    await retry(async () => {
      const { addToBagButton, xfoBagCount } = productSelectors;
      await this.page.waitForSelector(addToBagButton, {
        visible: true,
        timeout: 10000,
      });
      let before = 0;

      try {
        before = Number(
          await evaluateOnSelector(
            this.page,
            xfoBagCount,
            el => el.textContent?.trim()
          )
        ) || 0;
      } catch {
        // In some cases, bag count may not be present (first add); default to zero
        if (process.env.DEBUG === "true") console.log("[addToBag] Bag count not found, assuming 0");
      }
      const isDisabled = await this.page.$eval(
        addToBagButton,
        btn => btn.hasAttribute("disabled")
      );

      if (isDisabled) {
        // Fail immediately if button is unexpectedly disabled
        console.error("[addToBag] Add to bag button is disabled!");
        throw new Error("Add to bag button is disabled");
      }

      await clickElement(this.page, addToBagButton);

      // Prevents continuation until bag count is visibly mutated in DOM, avoiding race conditions
      await this.page.waitForFunction(
        (selector, prev) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          return parseInt(el.textContent || "0") > prev;
        },
        { timeout: 5000 },
        xfoBagCount,
        before
      );

      const after = Number(
        await evaluateOnSelector(
          this.page,
          xfoBagCount,
          el => el.textContent?.trim()
        )
      ) || 0;

      if (after <= before) {
        // Defensive: abort if increment not observed, even after click and wait
        console.error(`[addToBag] Error: Bag count did not increase (${before} → ${after})`);
        throw new Error(`Bag count did not increase (${before} → ${after})`);
      }
    });
  }

  async assertAddedToBag(): Promise<void> {
    await assertHasItems(this.page);
  }
}