import puppeteer from "puppeteer";

export async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  return { browser, page };
}