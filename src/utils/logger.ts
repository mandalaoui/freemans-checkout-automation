// Only outputs step and success logs when DEBUG is enabled to reduce console noise during normal runs.
// Error logs are always displayed to ensure visibility of issues.

function getTimestamp(): string {
    return new Date().toISOString();
}

export function logStep(stepName: string) {
    if (process.env.DEBUG === "true") console.log(`[${getTimestamp()}] [STEP] ${stepName}`);
}

export function logSuccess(message: string) {
    if (process.env.DEBUG === "true") console.log(`[${getTimestamp()}] [SUCCESS] ${message}`);
}

export function logError(message: string) {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`);
}