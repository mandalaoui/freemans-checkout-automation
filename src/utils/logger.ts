/**
 * Logger utility for consistent, timestamped step output.
 */

function getTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Logs a test step with a timestamp.
 * @param stepName - The name of the step being executed.
 */
export function logStep(stepName: string) {
    if (process.env.DEBUG === "true") console.log(`[${getTimestamp()}] [STEP] ${stepName}`);
}

/**
 * Logs a success message with a timestamp.
 * @param message - The message to log as a success.
 */
export function logSuccess(message: string) {
    if (process.env.DEBUG === "true") console.log(`[${getTimestamp()}] [SUCCESS] ${message}`);
}

/**
 * Logs an error message with a timestamp.
 * @param message - The error message to log.
 */
export function logError(message: string) {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`);
}

// Example usage:
// logStep("SELECT_SIZE");
// logSuccess("Added to bag");
// logError("Failed to add to bag");