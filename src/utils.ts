import { Page } from "puppeteer";

export async function retry<T>(
    fn: () => Promise<T>,
    attempts = 3,
    delayMs = 500
): Promise<T> {
    let lastError: any;

    for (let i = 1; i <= attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;

            console.warn(`Retry ${i}/${attempts} failed`);

            if (i < attempts) {
                await new Promise(res => setTimeout(res, delayMs));
            }
        }
    }

    throw lastError;
}

let currentStep = "";

export async function runStep(stepName: string, fn: () => Promise<void>) {
    console.log(`\n➡️ STEP: ${stepName}`);
    currentStep = stepName;

    try {
        await fn();
        console.log(`✔ SUCCESS: ${stepName}`);
    } catch (err) {
        console.error(`❌ FAILED: ${stepName}`);
        throw err;
    }
}