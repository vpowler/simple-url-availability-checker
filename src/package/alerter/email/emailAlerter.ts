import { IAlertMessage } from "../../../interfaces";
import { Alerter } from "../alerter";
import * as nodemailer from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

interface IEmailSettings {
  user: string;
  pass: string;
  email_to: string;
  email_subject: string;
}

export class EmailAlerter extends Alerter {
  private email_settings: IEmailSettings = {} as IEmailSettings;

  // nodemailer
  private transport: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private mailOptions;

  public init(): boolean {
    try {
      const { EMAIL_USER, EMAIL_PASS, EMAIL_TO, EMAIL_SUBJ } = process.env;
      this.email_settings.user = EMAIL_USER;
      this.email_settings.pass = EMAIL_PASS;
      this.email_settings.email_to = EMAIL_TO;
      this.email_settings.email_subject = EMAIL_SUBJ || `Alert from monitoring`;

      if (!(this.email_settings.user && this.email_settings.pass && this.email_settings.email_to)) {
        throw `cannot read email variables: ${JSON.stringify(this.email_settings)}`;
      }

      this.transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: this.email_settings.user,
          pass: this.email_settings.pass,
        },
      });

      this.mailOptions = {
        from: this.email_settings.user,
        to: this.email_settings.email_to,
        subject: this.email_settings.email_subject,
      };

      return true;
    } catch (err) {
      this.baseAlerterConfig.verbose === true && console.error(err);
    }
    return false;
  }

  public async send(msg: IAlertMessage): Promise<boolean> {
    const html = `<h1>URL ${msg.url} state changed.</h1>
                      <h3>Code: ${msg.response.code}</h3>
                      <h5>Reason: ${msg.response.text}</h5>
        `;
    const mailOptions = { ...this.mailOptions, ...{ html } };

    try {
      await this.sendMail(mailOptions);
      return true; // promise that message was sent
    } catch (err) {
      this.baseAlerterConfig.verbose === true && console.error(err);
    }

    return false;
  }

  private async sendMail(mailOptions) {
    return new Promise((resolve, reject) => {
      this.transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}
