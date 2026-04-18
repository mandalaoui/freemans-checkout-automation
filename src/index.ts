import dotenv from "dotenv";
dotenv.config();

import { launchBrowser } from "./browser/browser";
import { runHappyFlow } from "./flows/happyFlow";
import { runNegativeFlows } from "./flows/negativeFlows";
import { seedDbIfNeeded } from "./utils/actions.utils";

async function run() {
  // Before starting, ensure the form_fields table is seeded if it's empty.
  // This ensures the happy/negative flows have the form data they need.
  await seedDbIfNeeded();

  if (process.env.DEBUG === "true") console.log("Launching browser...");
  const { browser } = await launchBrowser();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    if (process.env.DEBUG === "true") console.log("Running Happy Flow...");
    await runHappyFlow(page);
    await context.close();
    if (process.env.DEBUG === "true") console.log("Happy Flow completed. Running Negative Flows...");
    await runNegativeFlows(browser);
    if (process.env.DEBUG === "true") console.log("Negative Flows completed.");
  } catch (err: any) {
    console.error("TEST FAILED");
    console.error("ERROR:", err.message);
  } finally {
    // Always close the browser to avoid resource leaks
    await browser.close();
  }
}

run();