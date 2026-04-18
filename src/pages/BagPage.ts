import { Page } from "puppeteer";
import {
    clickElement,
} from "../utils/actions.utils";
import { assertOpen } from "../validation/bag.validation";
import { assertCheckoutLoaded } from "../validation/checkout.validation";
import { selectors as bagSelectors } from "../selectors/bag.selectors";
import { commonSelectors } from "../selectors/common.selectors";

/**
 * Encapsulates bag actions to guard against flakiness throughout checkout.
 */
export class BagPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Attempts to open the bag only if not already open, preventing unnecessary UI interaction.
     */
    async open(): Promise<void> {
        const isAlreadyOpen = await this.page.$(bagSelectors.checkoutButton);
    
        if (isAlreadyOpen) {
            await assertOpen(this.page);
            return;
        }
    
        await clickElement(this.page, commonSelectors.bagButton);
    
        await this.page.waitForSelector(bagSelectors.checkoutButton, {
            visible: true,
            timeout: 5000,
        });
    
        await assertOpen(this.page);
    }

    /**
     * After clicking checkout, ensures that the checkout step loaded properly by explicit assertion.
     */
    async goToCheckout(): Promise<void> {
        await clickElement(this.page, bagSelectors.checkoutButton);
        await assertCheckoutLoaded(this.page, bagSelectors.checkoutIdentifier);
    }
}