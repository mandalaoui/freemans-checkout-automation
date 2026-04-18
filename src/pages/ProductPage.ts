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
 * ProductPage encapsulates product selection, variant choice, bagging, and assertions.
 * All actions leverage robust utility functions for DOM interaction.
 */
export class ProductPage {
    constructor(private page: Page) { }

    /**
     * Navigates to the given product URL and ensures the product page is fully loaded.
     */
    async open(productUrl: string): Promise<void> {
        await this.page.goto(productUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        await assertProductReady(this.page);
    }

    /**
     * Selects the first available color option if present.
     * Uses robust DOM evaluation.
     */
    async selectColor(): Promise<void> {
        await retry(async () => {
            await this.page.waitForSelector(productSelectors.colorButton, { visible: true, timeout: 10000 });
            const colorButtons = await this.page.$$(productSelectors.colorButton);
            if (!colorButtons.length) throw new Error("No colors");

            // Use clickElement utility for robust interaction
            // Always prefer using nth-of-type selectors for click
            await clickElement(this.page, `${productSelectors.colorButton}:nth-of-type(1)`);

            // Validate selection using evaluateOnSelector for reliability
            const isSelected = await evaluateOnSelector<boolean>(
                this.page,
                `${productSelectors.colorButton}:nth-of-type(1)`,
                el => el.classList.contains("selectedOption")
            );
            if (!isSelected) throw new Error("Color not selected");
        });
    }

    /**
     * Selects the first preferred size option from the available ones, falling back to the first.
     * Uses clickElement for robustness.
     */
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

            // ✔️ scroll (חשוב!)
            await this.page.evaluate(e => e.scrollIntoView({ block: "center" }), el);

            await el.click();

            // ✔️ validation (קריטי)
            const isSelected = await this.page.evaluate(
                e => e.classList.contains("selectedOption"),
                el
            );

            if (!isSelected) throw new Error("Size not selected");
        });
    }

    /**
     * Adds the selected product variant to the shopping bag and waits for the bag count to increment.
     * Uses robust clickElement and evaluateOnSelector.
     */
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
            if (process.env.DEBUG === "true") console.log("[addToBag] Bag count not found, assuming 0");
          }
          const isDisabled = await this.page.$eval(
            addToBagButton,
            btn => btn.hasAttribute("disabled")
          );

          if (isDisabled) {
            console.error("[addToBag] Add to bag button is disabled!");
            throw new Error("Add to bag button is disabled");
          }

          await clickElement(this.page, addToBagButton);

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
            console.error(`[addToBag] Error: Bag count did not increase (${before} → ${after})`);
            throw new Error(`Bag count did not increase (${before} → ${after})`);
          }
        });
      }
 

    /**
     * Verifies that the product has been added and the shopping bag is not empty.
     */
    async assertAddedToBag(): Promise<void> {
        await assertHasItems(this.page);
    }
}