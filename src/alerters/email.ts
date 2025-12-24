import * as nodemailer from "nodemailer";
import { IAlerter, IAlertMessage } from "../types";
import { logger } from "../lib/logger";

export class EmailAlerter implements IAlerter {
    private transport?: nodemailer.Transporter;
    private mailOptions: any;

    init(): boolean {
        const { EMAIL_USER, EMAIL_PASS, EMAIL_TO, EMAIL_SUBJ } = process.env;
        if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
            logger.warn("Email variables not set. Email alerter disabled.");
            return false;
        }

        try {
            this.transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: EMAIL_USER,
                    pass: EMAIL_PASS,
                },
            });

            this.mailOptions = {
                from: EMAIL_USER,
                to: EMAIL_TO,
                subject: EMAIL_SUBJ || "Alert from monitoring",
            };

            return true;
        } catch (err) {
            logger.error("Failed to initialize EmailAlerter", err);
            return false;
        }
    }

    async send(msg: IAlertMessage): Promise<void> {
        if (!this.transport) return;

        const html = `<h1>URL ${msg.url} state changed.</h1>
                  <h3>Code: ${msg.response.code}</h3>
                  <h5>Reason: ${msg.response.text}</h5>`;

        const mailOptions = { ...this.mailOptions, html };

        try {
            await this.transport.sendMail(mailOptions);
            logger.info(`Email sent for ${msg.url}`);
        } catch (err) {
            logger.error(`Failed to send email for ${msg.url}`, err);
        }
    }
}
