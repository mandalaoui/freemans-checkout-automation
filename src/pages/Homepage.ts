import { Page } from "puppeteer";
import { assertHomeReady } from "../validation/home.validation";
import { selectors as homeSelectors } from "../selectors/home.selectors";

const FREEMANS_URL = "https://www.freemans.com";

export class HomePage {
    constructor(private page: Page) { }

    async goToHomepage() {
        await this.page.goto(FREEMANS_URL, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });

        await this.page.waitForSelector(homeSelectors.heroContainer, { timeout: 10000 });
    }

    async acceptCookies() {
        try {
            const acceptBtnSelector = ".cookieConsentInnerBanner button.primary";
    
            await this.page.waitForSelector(acceptBtnSelector, {
                visible: true,
                timeout: 5000,
            });
    
            await this.page.click(acceptBtnSelector);
    
            await this.page.waitForSelector(".cookieConsentInnerBanner", {
                hidden: true,
                timeout: 5000,
            });
    
        } catch {
            // Ignore if cookie popup does not appear, as some tests/sessions may not trigger it
            if (process.env.DEBUG === "true") console.log("No cookie popup");
        }
    }

    async load(): Promise<void> {
        await this.goToHomepage();
        await this.acceptCookies();
        await assertHomeReady(this.page, homeSelectors.heroContainer);
    }
}