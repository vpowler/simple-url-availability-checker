import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { IAlerter, IAlertMessage } from "../types";
import { logger } from "../lib/logger";

export class AwsAlerter implements IAlerter {
    private client?: SNSClient;
    private topicArn?: string;

    init(): boolean {
        const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_TOPIC_ARN } = process.env;
        if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_TOPIC_ARN) {
            logger.warn("AWS variables not set. AWS alerter disabled.");
            return false;
        }

        try {
            this.client = new SNSClient({ region: AWS_REGION });
            this.topicArn = AWS_TOPIC_ARN;
            return true;
        } catch (err) {
            logger.error("Failed to initialize AwsAlerter", err);
            return false;
        }
    }

    async send(msg: IAlertMessage): Promise<void> {
        if (!this.client || !this.topicArn) return;

        const params = {
            Message: `URL ${msg.url}. Code: ${msg.response.code}. Reason: ${msg.response.text}`,
            TopicArn: this.topicArn,
        };

        try {
            await this.client.send(new PublishCommand(params));
            logger.info(`AWS SNS sent for ${msg.url}`);
        } catch (err) {
            logger.error(`Failed to send AWS SNS for ${msg.url}`, err);
        }
    }
}
