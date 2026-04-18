import { Page } from "puppeteer";
import {
    setCheckboxOrRadio,
} from "../utils/actions.utils";
import { retry } from "../utils/retry";
import { FormField } from "../types/form.types";
import { fillFields } from "../forms/formFiller";
import { selectors as paymentSelectors } from "../selectors/payment.selectors";
import { commonSelectors } from "../selectors/common.selectors";

/**
 * Encapsulates payment steps to ensure resilient, reliable automation of the payment process.
 */
export class PaymentPage {
    constructor(private page: Page) { }

    /**
     * Ensures "Pay Now" is actually selected—guards against flakiness in UI status indicators.
     */
    async selectPayNow(): Promise<void> {
        await this.page.waitForSelector(commonSelectors.confirmPayContainer, {
            visible: true,
            timeout: 15000,
        });

        await this.page.waitForSelector(paymentSelectors.paymentPayNowInput, {
            timeout: 15000,
        });

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
     * Delegates filling and validation to form utility to avoid duplicating domain-specific field logic.
     */
    async fillPaymentDetails(fields: FormField[]): Promise<void> {
        await fillFields(this.page, fields);
    }
}
