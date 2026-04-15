import { Page } from "puppeteer";
import { selectors } from "./selectors";
import {
    clickElement,
    typeText,
    selectDropdown,
    setCheckboxOrRadio,
    evaluateOnSelector
} from "./actions";

export async function goToHomepage(page: Page) {
    await page.goto("https://www.freemans.com/", {
        waitUntil: "networkidle2",
        timeout: 60000,
    });
    console.log("Homepage loaded");
}

export async function goToBag(page: Page) {
    await page.waitForSelector(selectors.bagButton, { visible: true });

    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        el?.scrollIntoView({ block: "center" });
    }, selectors.bagButton);

    await page.click(selectors.bagButton);

    await page.waitForSelector(selectors.checkoutButton, { timeout: 15000 });

    console.log("Navigated to bag");
}

export async function goToProduct(page: Page, productUrl: string) {
    await page.goto(productUrl, {
        waitUntil: "networkidle2",
        timeout: 60000,
    });
    console.log("Product page loaded");
}

export async function acceptCookies(page: Page) {
    try {
        await page.waitForSelector(selectors.cookieAcceptButton, { timeout: 5000 });
        const buttons = await page.$$(selectors.cookieAcceptButton);
        for (const button of buttons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text?.includes("Accept")) {
                await button.click();
                console.log("Cookies accepted");
                return;
            }
        }
        console.log("No cookie button found");
    } catch (err) {
        console.log("Cookie popup not found (maybe already closed)");
    }
}

export async function selectSize(page: Page) {
    await page.waitForSelector(selectors.sizeButton, { timeout: 10000 });
    const sizes = await page.$$(selectors.sizeButton);
    const preferredSizes = ["16", "14", "12", "18"];
    for (const size of sizes) {
        const text = await page.evaluate(el => el.textContent, size);
        if (preferredSizes.includes(text?.trim() ?? "")) {
            await size.click();
            console.log("Size selected:", text);
            return;
        }
    }
    throw new Error("No matching size found");
}

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
            console.log("Color selected:", color);
            return;
        }
    }
    throw new Error("No color button found");
}

export async function addToBag(page: Page) {
    await clickElement(page, selectors.addToBagButton);

    await page.waitForFunction(
        selector => {
            const el = document.querySelector(selector);
            return el && el.textContent && el.textContent.trim() !== "0";
        },
        { timeout: 10000 },
        selectors.xfoBagCount
    );

    const bagCount = await page.$eval(
        selectors.xfoBagCount,
        el => el.textContent?.trim()
    );

    console.log("Clicked Add to Bag");
    console.log("Bag count:", bagCount);
    console.log("Item added to bag (confirmed)");
}

export async function assertBagHasItems(page: Page) {
    await page.waitForSelector(selectors.xfoBagCount, { timeout: 10000 });

    const bagCount = await page.$eval(
        selectors.xfoBagCount,
        el => el.textContent?.trim() ?? ""
    );

    const isEmptyStateVisible = await page.$(".emptyBagState");

    if (bagCount === "0" || isEmptyStateVisible) {
        throw new Error(`Bag is empty. Current bag count: ${bagCount}`);
    }

    console.log(`Bag contains items. Current bag count: ${bagCount}`);
}

export async function goToCheckout(page: Page) {
    await clickElement(page, selectors.checkoutButton, { waitForNavigation: true });
    console.log("Clicked Checkout");
    console.log("Navigated to checkout page");
}

export async function goToGuestCheckout(page: Page) {
    await clickElement(page, selectors.guestCheckoutButton, { waitForNavigation: true });
    console.log("Clicked Guest Checkout");
    console.log("Navigated to delivery page");
}

export async function continueDelivery(page: Page) {
    await clickElement(page, selectors.applyButton);

    await page.waitForSelector(selectors.confirmPayContainer, {
        visible: true,
        timeout: 15000,
    });

    console.log("Continued to confirm order page");
}

export async function choosePayNow(page: Page) {
    console.log("Waiting for confirm pay container...");
    await page.waitForSelector(selectors.confirmPayContainer, {
        visible: true,
        timeout: 15000,
    });

    console.log("Waiting for payment 'Pay Now' container...");
    await page.waitForSelector(selectors.paymentPayNowContainer, {
        visible: true,
        timeout: 15000,
    });

    console.log("Clicking the 'Pay Now' container...");

    await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => { }),
        page.click(selectors.paymentPayNowContainer),
    ]);

    console.log("Waiting for card details container...");
    await page.waitForSelector(selectors.cardDetailsContainer, {
        visible: true,
        timeout: 15000,
    });

    console.log("Pay Now selected, card form revealed");
}

export async function fillCardDetails(page: Page) {
    await typeText(page, selectors.cardHolderName, "Steve Rosenblum");
    await typeText(page, selectors.cardNumber, "4111111111111111");
    await typeText(page, selectors.expiryDate, "12/30");
    await typeText(page, selectors.cardSecurityCode, "123");
    console.log("Card details filled");
}

export async function purchaseAvailable(page: Page) {
    await page.waitForSelector(selectors.applyButton, { visible: true });

    const isDisabled = await page.$eval(
        selectors.applyButton,
        (btn: any) => btn.disabled || btn.classList.contains("disabled")
    );

    if (isDisabled) {
        throw new Error("❌ Payment button is disabled");
    }

    console.log("✔️ Payment button is enabled and ready");
}