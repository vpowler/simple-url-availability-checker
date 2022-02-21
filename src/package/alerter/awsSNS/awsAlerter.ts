import { Alerter } from "../alerter";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { IAlertMessage } from "../../../interfaces";

interface IAWSSettings { region: string; topic_arn: string; }

export class AwsAlerter extends Alerter {
  private aws_settings: IAWSSettings = {} as IAWSSettings;

  init(): boolean {
    try {
      const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_TOPIC_ARN } =
        process.env;
      if (!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION && AWS_TOPIC_ARN)) {
        throw `cannot read AWS variables`;
      }
      this.aws_settings.region = AWS_REGION;
      this.aws_settings.topic_arn = AWS_TOPIC_ARN;
      return true;
    } catch (err) {
      this.baseAlerterConfig.verbose === true && console.error(err);
    }
    return false;
  }

  async send(msg: IAlertMessage): Promise<boolean> {
    const params = {
      Message: `URL ${msg.url}. Code: ${msg.response.code}. Reason: ${msg.response.text}`,
      TopicArn: this.aws_settings.topic_arn,
    };
    const snsClient = new SNSClient({ region: this.aws_settings.region });

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
