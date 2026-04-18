import { Page } from "puppeteer";
import {
    clickElement,
    selectDropdown,
} from "../utils/actions.utils";
import { retry } from "../utils/retry";
import { FormField } from "../types/form.types";
import { fillFields } from "../forms/formFiller";
import { getFormFields } from "../db/db";
import { selectors as checkoutSelectors } from "../selectors/checkout.selectors";
import { commonSelectors } from "../selectors/common.selectors";
import { validationSelectors } from "../selectors/validation.selectors";

/**
 * Encapsulates guest checkout, delivery, payment, and application flows
 * to reduce flakiness and provide a single source of assertion for test reliability.
 *
 * Utility methods are used here for robust element interaction and DOM querying.
 */
export class CheckoutPage {
    constructor(private page: Page) { }

    async startGuestCheckout(): Promise<void> {
        await clickElement(this.page, checkoutSelectors.guestCheckoutButton, {
            waitForNavigation: true,
        });

        await this.page.waitForSelector(checkoutSelectors.firstNameInput, {
            timeout: 10000,
        });
    }

    async fillInitialAddressForm(): Promise<void> {
        const allFields: FormField[] = await getFormFields();
        // Only fill the expected "initial" address details to avoid test brittleness on field additions
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

        // Only visible/active error messages should fail subsequent steps
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

        // Fail early if address search yields no selectable results (prevents hiding flakiness)
        const optionsCount = await this.page.$$eval(
            `${checkoutSelectors.addressSelect} option`,
            (opts) => opts.length
        );
        if (optionsCount === 0) {
            throw new Error("No address options loaded");
        }
    }

    async selectAddressFromResults(): Promise<void> {
        await this.page.waitForSelector(checkoutSelectors.addressSelect, {
            timeout: 10000,
        });

        // Filter out placeholder options to avoid selecting invalid entries
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

        // Prevents proceeding before dropdown selection is actually completed in the DOM
        await this.page.waitForFunction(
            (selector, expected) => {
                const el = document.querySelector(selector) as HTMLSelectElement;
                return el && el.value === expected;
            },
            {},
            checkoutSelectors.addressSelect,
            valueToSelect
        );

        // Ensure summary is populated (protects against async rendering issues)
        await this.page.waitForFunction((selector) => {
            const el = document.querySelector(selector);
            return el && el.textContent && el.textContent.trim().length > 0;
        }, {}, checkoutSelectors.addressSummary);
    }

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

        // Prevents sending mismatched credentials, which would invalidate the test of positive flows
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

    async clickContinue(): Promise<void> {
        await this.page.waitForSelector(commonSelectors.applyButton, {
            visible: true,
        });

        await clickElement(this.page, commonSelectors.applyButton);

        // Protects against advancing in the flow until the next UI state is ready
        await this.page.waitForSelector(commonSelectors.deliveryContainerWrapper, {
            timeout: 15000,
        });
    }
}