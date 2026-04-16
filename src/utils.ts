/**
 * Retry an async function a number of times with a delay between attempts.
 * Throws the last encountered error if all attempts fail.
 */
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
            // Wait before the next attempt, unless this was the last attempt
            if (i < attempts) {
                await new Promise(res => setTimeout(res, delayMs));
            }
        }
    }

    throw new Error(`Step ${currentStep || "unknown"} failed: ${lastError && lastError.message ? lastError.message : lastError}`);
}

let currentStep = "";

/**
 * Execute a named step with retry and optional validation.
 * Throws if validation fails or all retry attempts fail.
 */
export async function runStep(
    stepName: string,
    fn: () => Promise<void>,
    validate?: () => Promise<boolean>
) {
    currentStep = stepName;

    await retry(async () => {
        await fn();

        if (validate) {
            const ok = await validate();
            if (!ok) throw new Error("Validation failed");
        }
    });
}