import { Page } from "puppeteer";
import { selectors } from "./selectors";

export async function goToHomepage(page: Page) {
    await page.goto("https://www.freemans.com/", {
        waitUntil: "networkidle2",
        timeout: 60000,
    });

    console.log("Homepage loaded");
}

export async function goToBag(page: Page) {
    await page.waitForSelector(selectors.bagButton, { timeout: 10000 });
    await page.click(selectors.bagButton);

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

    for (const size of sizes) {
        const text = await page.evaluate(el => el.textContent, size);

        // Try some sizes, e.g., 12, 14, 16, 18
        const preferredSizes = ["16", "14", "12", "18"];
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
    await page.waitForSelector(selectors.addToBagButton, { timeout: 10000 });

    await page.click(selectors.addToBagButton);

    console.log("Clicked Add to Bag");

    await page.waitForFunction(() => {
        const el = document.querySelector("#xfoBagCount");
        return el && el.textContent !== "0";
    });

    console.log("Item added to bag (confirmed)");

}