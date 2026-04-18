import { Page } from "puppeteer";
import {
    setCheckboxOrRadio,
    evaluateOnSelector,
} from "../utils/actions.utils";
import { retry } from "../utils/retry";
import { FormField } from "../types/form.types";
import { fillFields } from "../forms/formFiller";
import { selectors as paymentSelectors } from "../selectors/payment.selectors";
import { commonSelectors } from "../selectors/common.selectors";

/**
 * PaymentPage encapsulates payment-related steps: selecting payment type and filling payment details.
 * All actions leverage robust utility functions for DOM interaction.
 */
export class PaymentPage {
    constructor(private page: Page) { }

    /**
     * Select "Pay Now" as the payment mode using robust utilities, then wait for card details to be visible.
     */
    async selectPayNow(): Promise<void> {
        await this.page.waitForSelector(commonSelectors.confirmPayContainer, {
            visible: true,
            timeout: 15000,
        });

        await this.page.waitForSelector(paymentSelectors.paymentPayNowInput, {
            timeout: 15000,
        });

        // Use setCheckboxOrRadio utility to robustly select the "Pay Now" radio input
        await retry(async () => {

            await setCheckboxOrRadio(this.page, paymentSelectors.paymentPayNowInput, true);

            await this.page.waitForFunction(
                (sel) => (document.querySelector(sel) as HTMLInputElement)?.checked === true,
                {},
                paymentSelectors.paymentPayNowInput
            );

            const checked = await this.page.evaluate((sel) => {
                const input = document.querySelector(sel);
                if (!input) return false;

                const wrapper = input.closest('.radio-wrapper');
                return wrapper?.classList.contains('checked');
            }, paymentSelectors.paymentPayNowInput);


            if (!checked) throw new Error("Pay Now radio input not selected");

            await this.page.waitForSelector(paymentSelectors.cardDetailsContainer, {
                visible: true,
            });
        });
    }

    /**
     * Fill in card/payment details using provided fields and assert purchase availability.
     * Uses form utilities for reliable DOM input.
     */
    async fillPaymentDetails(fields: FormField[]): Promise<void> {
        await fillFields(this.page, fields);
    }
}
