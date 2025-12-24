import { IAlerter, IAlertMessage } from "../types";
import { EmailAlerter } from "./email";
import { AwsAlerter } from "./aws";
import { logger } from "../lib/logger";

class AlerterManager {
    private alerters: IAlerter[] = [];

    constructor() {
        const candidates = [new EmailAlerter(), new AwsAlerter()];

        candidates.forEach(alerter => {
            if (alerter.init()) {
                this.alerters.push(alerter);
            }
        });

        if (this.alerters.length === 0) {
            logger.warn("No alerters enabled.");
        }
    }

    async sendAll(msg: IAlertMessage) {
        await Promise.all(this.alerters.map(a => a.send(msg)));
    }
}

export const alerterManager = new AlerterManager();
