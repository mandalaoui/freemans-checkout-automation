import { Page } from "puppeteer";
import { clickElement } from "../utils/actions.utils";
import { retry } from "../utils/retry";
import { commonSelectors } from "../selectors/common.selectors";

export class DeliveryPage {
    constructor(private page: Page) { }

    /**
     * Waits for the delivery container to be visible, clicks Apply, and waits for confirmation.
     * Uses clickElement from actions.utils.ts for robust clicking/waiting.
     */
    async continueFromDelivery(): Promise<void> {
        await this.page.waitForSelector(commonSelectors.deliveryContainerWrapper, {
            visible: true,
            timeout: 10000,
        });

        await retry(async () => {
            await clickElement(this.page, commonSelectors.applyButton, {
                waitForSelectorAfter: commonSelectors.confirmPayContainer,
            });
        });
    }
}