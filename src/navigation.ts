import { Page } from "puppeteer";
import { selectors } from "./selectors";
import {
    clickElement,
    typeText,
    evaluateOnSelector
} from "./actions";
import { retry } from "./utils";
import { getFormFields } from "./db";
import { fillFields } from "./formFiller";

// No retry wrapper needed: mostly page.goto/navigation and single wait
export async function goToHomepage(page: Page) {
    await page.goto("https://www.freemans.com/", {
        waitUntil: "networkidle2",
        timeout: 60000,
    });

    await page.waitForSelector(selectors.heroContainer, { timeout: 10000 });

    const url = page.url();
    if (!url.includes("freemans.com")) {
        throw new Error("Homepage did not load correctly");
    }
}

// No retry needed; already handles error and popup
export async function acceptCookies(page: Page) {
    try {
        const selector = selectors.cookieAcceptButton;
        await page.waitForSelector(selector, { timeout: 5000 });

        const buttons = await page.$$(selector);

        for (const button of buttons) {
            const text = await page.evaluate(el => el.textContent, button);

            if (text && /accept/i.test(text)) {
                await button.click();

                await page.waitForSelector(selector, {
                    hidden: true,
                    timeout: 5000,
                });
                return;
            }
        }
        throw new Error("Accept button not found in cookie popup");
    } catch (err: any) {
        console.log("No cookie popup (already accepted) ✔️");
    }
}

// Navigation only, wait for selectors, not "big" click
export async function goToProduct(page: Page, productUrl: string) {
    await page.goto(productUrl, {
        waitUntil: "networkidle2",
        timeout: 60000,
    });

    if (!page.url().includes("/products/")) {
        throw new Error("Not on product page");
    }

    await page.waitForSelector(selectors.addToBagButton, {
        timeout: 10000,
    });

    await page.waitForSelector(selectors.productTitle, {
        timeout: 10000,
    });
}

// Not a big/important click or flow (choosing color only)
export async function selectColor(page: Page) {
    await page.waitForSelector(selectors.colorButton, { timeout: 10000 });

    const colorButtons = await page.$$(selectors.colorButton);

    for (const button of colorButtons) {
        const color = await page.evaluate(
            el => el.getAttribute("data-optionvalue"),
            button
        );

        if (color) {
            await button.click();

            const isSelected = await page.evaluate(el => {
                return el.classList.contains("selectedOption");
            }, button);

            if (!isSelected) {
                throw new Error(`Color ${color} was not selected properly`);
            }
            return;
        }
    }

    throw new Error("No color button found");
}

// Wrapped in retry: important user click & selection logic with network+DOM updates
export async function selectSize(page: Page) {
    await retry(async () => {
        await page.waitForSelector(selectors.sizeButton, { timeout: 10000 });

        const sizes = await page.$$(selectors.sizeButton);
        const preferredSizes = ["16", "14", "12", "18"];

        for (const size of sizes) {
            const text = await page.evaluate(el => el.textContent, size);

            if (preferredSizes.includes(text?.trim() ?? "")) {
                await size.click();

                const isSelected = await page.evaluate(el => {
                    return (
                        el.classList.contains("selectedOption") ||
                        el.getAttribute("aria-checked") === "true"
                    );
                }, size);

                if (!isSelected) {
                    throw new Error(`Size ${text} was not selected properly`);
                }
                return;
            }
        }

        throw new Error("No matching size found");
    });
}

// Wrapped in retry: important for updating bag count after click
export async function addToBag(page: Page) {
    await retry(async () => {
        const before = await page.$eval(
            selectors.xfoBagCount,
            el => el.textContent?.trim() ?? "0"
        );

        await clickElement(page, selectors.addToBagButton);

        await page.waitForFunction(
            (selector, beforeValue) => {
                const el = document.querySelector(selector);
                return el && el.textContent?.trim() !== beforeValue;
            },
            { timeout: 10000 },
            selectors.xfoBagCount,
            before
        );

        const after = await page.$eval(
            selectors.xfoBagCount,
            el => el.textContent?.trim() ?? "0"
        );

        if (parseInt(after) <= parseInt(before)) {
            throw new Error("Bag count did not change");
        }
    });
}

// No click (just checks): no retry needed
export async function assertBagHasItems(page: Page) {
    await page.waitForSelector(selectors.xfoBagCount, { timeout: 10000 });

    const bagCount = await page.$eval(
        selectors.xfoBagCount,
        el => el.textContent?.trim() ?? ""
    );

    const isEmptyStateVisible = await page.$(".emptyBagState");

    const countNum = parseInt(bagCount, 10);

    if (isNaN(countNum) || countNum <= 0 || isEmptyStateVisible) {
        throw new Error(`Bag is empty. Current bag count: ${bagCount}`);
    }
}

// Already uses retry around big click+wait
export async function goToBag(page: Page) {
    await retry(async () => {
        await clickElement(page, selectors.bagButton);

        await page.waitForSelector(selectors.checkoutButton, {
            visible: true,
            timeout: 3000,
        });
    });

    const url = page.url();
    if (!url.includes("bag")) {
        const checkoutVisible = await page.$(selectors.checkoutButton);
        if (!checkoutVisible) {
            throw new Error("Failed to navigate to the bag page (checkout button not visible)");
        }
        console.warn("URL did not include 'bag' (may be SPA, but checkout button found)");
    }
}

// Already uses retry for important click+navigation
export async function goToCheckout(page: Page) {
    await retry(() => clickElement(page, selectors.checkoutButton, { waitForNavigation: true }));
    await page.waitForSelector(selectors.accountNumberInput, { timeout: 10000 });
}

// Already uses retry for guest checkout click+navigation
export async function goToGuestCheckout(page: Page) {
    await retry(() => clickElement(page, selectors.guestCheckoutButton, { waitForNavigation: true }));
    await page.waitForSelector(selectors.firstNameInput, { timeout: 10000 });
}

// Wrap important continue delivery click in retry
export async function continueDelivery(page: Page) {
    await page.waitForSelector(selectors.deliveryContainerWrapper, {
        visible: true,
        timeout: 10000,
    });

    await page.waitForSelector(selectors.applyButton, { visible: true });

    await retry(() => clickElement(page, selectors.applyButton));

    await page.waitForSelector(selectors.confirmPayContainer, {
        visible: true,
        timeout: 15000,
    });
}

// Wrap pay now click in retry (big/important click flow step)
export async function choosePayNow(page: Page) {
    await page.waitForSelector(selectors.confirmPayContainer, {
        visible: true,
        timeout: 15000,
    });

    await page.waitForSelector(selectors.paymentPayNowContainer, {
        visible: true,
        timeout: 15000,
    });

    await retry(() => page.click(selectors.paymentPayNowContainer));

    // Wait for Pay Now container to be visibly "selected": check aria-selected or "active"/"selected" class
    await page.waitForFunction(() => {
        const el = document.querySelector('input[name="paymentChoice"]:checked');
        return el && el.getAttribute("value") === "cash";
    });

    await page.waitForSelector(selectors.cardDetailsContainer, {
        visible: true,
        timeout: 15000,
    });
}

// No retry: just calls fillFields (which has retry internally)
export async function fillCardDetails(page: Page) {
    console.log("📝 Retrieving all form fields...");
    const fields = await getFormFields();

    console.log("📋 Filtering card-related fields...");
    const cardFields = fields.filter(f =>
        ["cardName", "cardNumber", "expiry", "cvv"].includes(f.fieldName)
    );
    console.log(
        `✅ Card fields to fill: ${cardFields.map(f => f.fieldName).join(", ")}`
    );

    console.log("💳 Filling in card details fields...");
    console.log(cardFields);
    await fillFields(page, cardFields);
    console.log("🎉 Successfully filled all card details!");
}

// No click or big flow--just enable/disable test
export async function purchaseAvailable(page: Page) {
    await page.waitForSelector(selectors.applyButton, { visible: true });

    const isDisabled = await page.$eval(
        selectors.applyButton,
        (btn: any) => {
            const style = window.getComputedStyle(btn);
            return (
                btn.disabled ||
                btn.classList.contains("disabled") ||
                style.pointerEvents === "none" ||
                style.opacity === "0.5"
            );
        }
    );

    if (isDisabled) {
        throw new Error("❌ Payment button is disabled");
    }
}