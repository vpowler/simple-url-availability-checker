import { request } from "../util/network";
import { config } from "../../config/config";
import { alerterLoader } from "../alerter/loader";
import { IAlertMessage, INetworkResponse } from "../../interfaces";

export class Checker {
  private readonly url: string;

  private currentState: "alerted" | "normal" = "normal";
  private lastAlerted = 0;
  private lastResponse: INetworkResponse;

  constructor(url: string) {
    this.url = url;
  }

  private currentTime = () => +(Date.now() / 1000).toFixed(0);

  private setLastAlerted() {
    this.lastAlerted = this.currentTime();
  }

  private toggleAlert() {
    this.currentTime() - this.lastAlerted > config.alertInterval && this.sendAlert() && this.setLastAlerted();
    this.currentState = this.currentState === "normal" ? "alerted" : "normal";
  }

  private sendAlert() {
    // create alert message
    const { url } = this;
    const response = this.lastResponse;
    const msg: IAlertMessage = { url, response };
    // send alert message using all alerters
    alerterLoader.sendAll(msg); // promise is being ignored
    return true;
  }

  public async urlCheck() {
    process.stdout.write(`Checking ${this.url}: `);
    this.lastResponse = await request(this.url);
    process.stdout.write(`${this.lastResponse.text}\n`);
    this.lastResponse.code !== 200 && this.currentState === "normal" && this.toggleAlert();
    this.lastResponse.code === 200 && this.currentState === "alerted" && this.toggleAlert();
  }
}
