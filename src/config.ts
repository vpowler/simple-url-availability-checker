export const config = Object.freeze({
    urlTimeout: +(process.env.TIMEOUT || 1000),
    urlsLine: process.env.URLS || "https://www.google.com https://www.amazon.com",
    sleepBetweenChecks: +(process.env.SLEEP || 15),
    alertInterval: +(process.env.INTERVAL || 300)
});
