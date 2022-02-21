import { Alerter } from "../alerter";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { IAlertMessage } from "../../../interfaces";

export class AwsAlerter extends Alerter {
  private topic_arn = "";

  init(): boolean {
    try {
      const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_TOPIC_ARN } =
        process.env;
      if (!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_TOPIC_ARN)) {
        throw `cannot read AWS variables`;
      }
      this.topic_arn = AWS_TOPIC_ARN;
      return true;
    } catch (err) {
      this.baseAlerterConfig.verbose === true && console.error(err);
    }
    return false;
  }

  async send(msg: IAlertMessage): Promise<boolean> {
    const params = {
      Message: `URL ${msg.url}. Code: ${msg.response.code}. Reason: ${msg.response.text}`,
      TopicArn: this.topic_arn,
    };
    const snsClient = new SNSClient({ region: "eu-west-1" });

    try {
      const data = await snsClient.send(new PublishCommand(params));
      if (data.$metadata.httpStatusCode === 200) {
        return true; // promise that message was sent
      }
    } catch (err) {
      this.baseAlerterConfig.verbose === true && console.error(err);
    }
    return false;
  }
}
