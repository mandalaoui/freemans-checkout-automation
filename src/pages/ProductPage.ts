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

            // Always prefer using nth-of-type selectors for click due to possible hidden or extra color options
            await clickElement(this.page, `${productSelectors.colorButton}:nth-of-type(1)`);

            // Ensures we do not proceed if DOM fails to report selected state after UI update
            const isSelected = await evaluateOnSelector<boolean>(
                this.page,
                `${productSelectors.colorButton}:nth-of-type(1)`,
                el => el.classList.contains("selectedOption")
            );
            if (!isSelected) throw new Error("Color not selected");
        });
    }

    async selectSize(): Promise<void> {
        await retry(async () => {
            await this.page.waitForSelector(productSelectors.sizeButton, {
                visible: true,
                timeout: 10000,
            });

            const sizes = await this.page.$$(productSelectors.sizeButton);
            const preferredSizes = ["16", "14", "12", "18"];

            let indexToClick = 0;

            for (let i = 0; i < sizes.length; i++) {
                const text = (await this.page.evaluate(el => el.textContent, sizes[i]))?.trim();
                if (preferredSizes.includes(text || "")) {
                    indexToClick = i;
                    break;
                }
            }

            const el = sizes[indexToClick];

            // Scrolling centers the element to avoid accidental misclicks on partially hidden options
            await this.page.evaluate(e => e.scrollIntoView({ block: "center" }), el);

            await el.click();

            // Fails fast if UI does not reflect selected state after clicking
            const isSelected = await this.page.evaluate(
                e => e.classList.contains("selectedOption"),
                el
            );

            if (!isSelected) throw new Error("Size not selected");
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