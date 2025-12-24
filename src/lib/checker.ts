import { config } from "../config";
import { request } from "./network";
import { logger } from "./logger";
import { alerterManager } from "../alerters";
import { INetworkResponse } from "../types";

export class Checker {
    private currentState: "alerted" | "normal" = "normal";
    private lastAlerted = 0;
    private lastResponse?: INetworkResponse;

    constructor(private readonly url: string) { }

    private get now() {
        return Math.floor(Date.now() / 1000);
    }

    private async toggleAlert() {
        // Only send alert if interval passed
        if (this.now - this.lastAlerted > config.alertInterval) {
            if (this.lastResponse) { // Should always be true here
                await alerterManager.sendAll({
                    url: this.url,
                    response: this.lastResponse
                });
                this.lastAlerted = this.now;
            }
        }
        this.currentState = this.currentState === "normal" ? "alerted" : "normal";
    }

    public async check() {
        logger.info(`Checking ${this.url}`);

        this.lastResponse = await request(this.url, config.urlTimeout);
        logger.info(`Response for ${this.url}: ${this.lastResponse.code} - ${this.lastResponse.text}`);

        const isSuccess = this.lastResponse.code === 200;

        if (!isSuccess && this.currentState === "normal") {
            await this.toggleAlert();
        } else if (isSuccess && this.currentState === "alerted") {
            await this.toggleAlert();
        }
    }
}
