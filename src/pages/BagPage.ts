import { Page } from "puppeteer";
import {
    clickElement,
} from "../utils/actions.utils";
import { retry } from "../utils/retry";
import { assertOpen } from "../validation/bag.validation";
import { assertCheckoutLoaded } from "../validation/checkout.validation";
import { selectors as bagSelectors } from "../selectors/bag.selectors";
import { commonSelectors } from "../selectors/common.selectors";

/**
 * BagPage encapsulates actions related to viewing and beginning checkout from the cart/bag.
 */
export class BagPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Opens the bag/cart overlay or page and ensures the checkout interface is ready.
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
     * Proceeds from the bag to the checkout step; expects appropriate identifier to load.
     */
    async goToCheckout(): Promise<void> {
        await clickElement(this.page, bagSelectors.checkoutButton);
        await assertCheckoutLoaded(this.page, bagSelectors.checkoutIdentifier);
    }
}