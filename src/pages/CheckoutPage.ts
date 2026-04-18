import { Page } from "puppeteer";
import {
    clickElement,
    selectDropdown,
    evaluateOnSelector,
} from "../utils/actions.utils";
import { retry } from "../utils/retry";
import { FormField } from "../types/form.types";
import { fillFields } from "../forms/formFiller";
import { getFormFields } from "../db/db";
import { selectors as checkoutSelectors } from "../selectors/checkout.selectors";
import { commonSelectors } from "../selectors/common.selectors";
import { validationSelectors } from "../selectors/validation.selectors";

/**
 * CheckoutPage encapsulates actions and verifications relevant to the guest checkout,
 * delivery, payment, and purchase application flows.
 *
 * NOTE: Actions use utility methods from actions.utils.ts for element interaction,
 * DOM evaluation, and robust input handling.
 */
export class CheckoutPage {
    constructor(private page: Page) { }

    /**
     * Click the guest checkout button, wait for the first name input to appear.
     */
    async startGuestCheckout(): Promise<void> {
        await clickElement(this.page, checkoutSelectors.guestCheckoutButton, {
            waitForNavigation: true,
        });

        await this.page.waitForSelector(checkoutSelectors.firstNameInput, {
            timeout: 10000,
        });
    }

    /**
     * Fill the initial address/customer details form and check for visible errors.
     */
    async fillInitialAddressForm(): Promise<void> {
        const allFields: FormField[] = await getFormFields();
        // Use the canonical set of "initial" address detail field names.
        const initialFieldNames = [
            "title",
            "firstName",
            "lastName",
            "day",
            "month",
            "year",
            "phone",
            "house",
            "postcode",
        ];
        const initialFields = allFields.filter((f) =>
            initialFieldNames.includes(f.fieldName)
        );
        await fillFields(this.page, initialFields);

        // Use evaluateOnSelector (from utils) for safer DOM querying.
        const visibleErrors = await this.page.$$eval(
            validationSelectors.formError,
            (els) =>
                els
                    .filter((el) => {
                        const style = window.getComputedStyle(el);
                        return (
                            style.display !== "none" &&
                            style.visibility !== "hidden" &&
                            style.opacity !== "0" &&
                            el.textContent?.trim()
                        );
                    })
                    .map((el) => el.textContent!.trim())
        );

        if (visibleErrors.length > 0) {
            throw new Error(`Form errors found: ${visibleErrors.join(", ")}`);
        }
    }

    /**
     * Click "Find Address" button and ensure address select options are loaded.
     */
    async clickFindAddress(): Promise<void> {
        await this.page.waitForSelector(checkoutSelectors.findAddressButton, {
            visible: true,
            timeout: 10000,
        });

        await clickElement(this.page, checkoutSelectors.findAddressButton);

        await this.page.waitForSelector(checkoutSelectors.addressSelect, {
            visible: true,
            timeout: 10000,
        });

        // Use evaluateOnSelector for robust querying
        const optionsCount = await this.page.$$eval(
            `${checkoutSelectors.addressSelect} option`,
            (opts) => opts.length
        );
        if (optionsCount === 0) {
            throw new Error("No address options loaded");
        }
    }

    /**
     * Select the first valid address option from the dropdown after lookup.
     */
    async selectAddressFromResults(): Promise<void> {
        await this.page.waitForSelector(checkoutSelectors.addressSelect, {
            timeout: 10000,
        });

        // Get all valid (non-placeholder) option values
        const options: string[] = await this.page.$$eval(
            `${checkoutSelectors.addressSelect} option`,
            (opts) =>
                opts
                    .map((o) => o.value)
                    .filter(
                        (v) =>
                            v &&
                            v.trim() !== "" &&
                            v !== "Please select from the list" &&
                            v !== "none"
                    )
        );

        if (!options.length) {
            console.error("[CheckoutPage] No valid address options found");
            throw new Error("No valid address options found");
        }

        const valueToSelect = options[0];
        await retry(() =>
            selectDropdown(this.page, checkoutSelectors.addressSelect, valueToSelect)
        );

        await this.page.waitForFunction(
            (selector, expected) => {
                const el = document.querySelector(selector) as HTMLSelectElement;
                return el && el.value === expected;
            },
            {},
            checkoutSelectors.addressSelect,
            valueToSelect
        );

        await this.page.waitForFunction((selector) => {
            const el = document.querySelector(selector);
            return el && el.textContent && el.textContent.trim().length > 0;
        }, {}, checkoutSelectors.addressSummary);
    }

    /**
     * Fill post-address form fields and ensure validations (email/pass confirm).
     */
    async fillPostAddressForm(): Promise<void> {
        const allFields: FormField[] = await getFormFields();
        const postFieldNames = [
            "email",
            "confirmEmail",
            "password",
            "confirmPassword",
        ];
        const postFields = allFields.filter((f) =>
            postFieldNames.includes(f.fieldName)
        );

        // Validate that emails and passwords match.
        const emailField = postFields.find((f) => f.fieldName === "email");
        const confirmEmailField = postFields.find(
            (f) => f.fieldName === "confirmEmail"
        );
        const passwordField = postFields.find((f) => f.fieldName === "password");
        const confirmPasswordField = postFields.find(
            (f) => f.fieldName === "confirmPassword"
        );

        if (
            emailField &&
            confirmEmailField &&
            emailField.value !== confirmEmailField.value
        ) {
            throw new Error("Email and Confirm Email values do not match");
        }
        if (
            passwordField &&
            confirmPasswordField &&
            passwordField.value !== confirmPasswordField.value
        ) {
            throw new Error("Password and Confirm Password values do not match");
        }

        await fillFields(this.page, postFields);
    }

    /**
     * Click the "Continue" or "Apply" button and wait for the next form container.
     */
    async clickContinue(): Promise<void> {
        await this.page.waitForSelector(commonSelectors.applyButton, {
            visible: true,
        });

        await clickElement(this.page, commonSelectors.applyButton);

        await this.page.waitForSelector(commonSelectors.deliveryContainerWrapper, {
            timeout: 15000,
        });
    }
}