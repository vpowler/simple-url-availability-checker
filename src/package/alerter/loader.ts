import { EmailAlerter } from "./email/emailAlerter";
import { AwsAlerter } from "./awsSNS/awsAlerter";
import { IAlertMessage, IAlerterConfig } from "../../interfaces";
import { Alerter } from "./alerter";

class AlerterLoader {
  private alerters: Alerter[] = [];

  constructor() {
    const cfg: IAlerterConfig = {verbose: true};

    const availableAlerters = [
        new EmailAlerter(cfg), new AwsAlerter(cfg)
    ];

    // try init
    availableAlerters.map((alerter) => alerter.init() && this.alerters.push(alerter));

    // check if there any alerters available
    this.alerters.length === 0 &&
      console.log(
        `Warning: The alerter loader wasn't able to load at least one alerter.`
      );
  }

  public async sendAll(msg: IAlertMessage) {
    this.alerters.map(async (alerter) => await alerter.send(msg));
  }
}

const alerterLoader = new AlerterLoader();
export { alerterLoader };
