import puppeteer from "puppeteer";

// Launches a new browser instance (not headless for debugging purposes)
export async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  return { browser };
}