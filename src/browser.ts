import puppeteer from "puppeteer";

export async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const page = await browser.newPage();

  return { browser, page };
}