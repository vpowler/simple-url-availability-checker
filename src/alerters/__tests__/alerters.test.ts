import { EmailAlerter } from "../email";
import * as nodemailer from "nodemailer";
import { AwsAlerter } from "../aws";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

jest.mock("nodemailer");
jest.mock("@aws-sdk/client-sns");
jest.mock("../../lib/logger");

describe("EmailAlerter", () => {
    let alerter: EmailAlerter;

    beforeEach(() => {
        process.env.EMAIL_USER = "user@test.com";
        process.env.EMAIL_PASS = "pass";
        process.env.EMAIL_TO = "to@test.com";
        alerter = new EmailAlerter();
        jest.clearAllMocks();
    });

    it("should initialize correctly with env vars", () => {
        expect(alerter.init()).toBe(true);
    });

    it("should not initialize without env vars", () => {
        delete process.env.EMAIL_USER;
        expect(alerter.init()).toBe(false);
    });

    it("should send email", async () => {
        alerter.init();
        const sendMailMock = jest.fn().mockResolvedValue("sent");
        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: sendMailMock
        });
        // We need to re-init to pick up the mock return
        alerter.init();

        await alerter.send({
            url: "http://test.com",
            response: { code: 500, text: "Error" }
        });

        expect(sendMailMock).toHaveBeenCalled();
    });
});

describe("AwsAlerter", () => {
    let alerter: AwsAlerter;

    beforeEach(() => {
        process.env.AWS_ACCESS_KEY_ID = "key";
        process.env.AWS_SECRET_ACCESS_KEY = "secret";
        process.env.AWS_REGION = "us-east-1";
        process.env.AWS_TOPIC_ARN = "arn:aws:sns:us-east-1:123:topic";
        alerter = new AwsAlerter();
        jest.clearAllMocks();
    });

    it("should initialize correctly with env vars", () => {
        expect(alerter.init()).toBe(true);
    });

    it("should send SNS message", async () => {
        alerter.init();
        const sendMock = jest.fn().mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
        (SNSClient as jest.Mock).mockImplementation(() => ({
            send: sendMock
        }));
        // We need to re-init to pick up the mock return
        alerter.init();

        await alerter.send({
            url: "http://test.com",
            response: { code: 500, text: "Error" }
        });

        expect(sendMock).toHaveBeenCalledWith(expect.any(PublishCommand));
    });
});
