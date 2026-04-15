import { launchBrowser } from "./browser";
import { runHappyFlow } from "./flows/happyFlow";
import { runNegativeFlows } from "./flows/negativeFlows";

async function run() {
  const { browser, page } = await launchBrowser();
  try {
    console.log("\n🚀 RUNNING HAPPY FLOW\n");

    await runHappyFlow(page);

    // await page.close();
    console.log("\n✅ HAPPY FLOW PASSED\n");

    // console.log("\n🚀 RUNNING NEGATIVE FLOWS\n");
    // await runNegativeFlows(browser);
    // console.log("\n🎉 ALL TESTS PASSED");

  } catch (err: any) {
    console.error("\n💥 TEST FAILED");
    console.error("ERROR:", err.message);

  } finally {
    // await browser.close();
  }
}

run();