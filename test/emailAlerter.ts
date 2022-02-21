import { EmailAlerter } from "../src/package/alerter/email/emailAlerter";
import { IAlertMessage } from "../src/interfaces";

(async () => {
  const msg: IAlertMessage = {
    url: "https://sampleurl.com",
    response: {
      code: 0,
      text: "SampleStatus",
    },
  };
  const alerter = new EmailAlerter({ verbose: true });
  if (!alerter.init()) {
    return;
  }
  await alerter.send(msg);
})();
