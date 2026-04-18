/**
 * Retry an async function a number of times with a delay between attempts.
 * Throws the last encountered error if all attempts fail.
 */

export async function retry<T>(
    fn: () => Promise<T>,
    attempts = 2,
    delayMs = 200, 
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

    throw lastError instanceof Error ? lastError : new Error(`Retry failed: ${String(lastError)}`);
}