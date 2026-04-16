import { launchBrowser } from "./browser";
import { runHappyFlow } from "./flows/happyFlow";
import { runNegativeFlows } from "./flows/negativeFlows";

async function run() {
  // Launch a new browser instance and create a context/page for tests
  const { browser } = await launchBrowser();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    // Run the "Happy" (positive path) flow
    await runHappyFlow(page);

    await context.close();

    // Run known negative flows to validate error handling
    await runNegativeFlows(browser);

  } catch (err: any) {
    // Log any test failure to aid in debugging
    console.error("TEST FAILED");
    console.error("ERROR:", err.message);

  } finally {
    // Always close the browser to avoid resource leaks
    await browser.close();
  }
}

run();