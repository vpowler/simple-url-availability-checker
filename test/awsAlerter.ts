import { IAlertMessage } from "../src/interfaces";
import { AwsAlerter } from "../src/package/alerter/awsSNS/awsAlerter";

(async () => {
  const msg: IAlertMessage = {
    url: "https://sampleurl.com",
    response: {
      code: 0,
      text: "SampleStatus",
    },
  };
  const alerter = new AwsAlerter({ verbose: true });
  if (!alerter.init()) {
    return;
  }
  await alerter.send(msg);
})();
