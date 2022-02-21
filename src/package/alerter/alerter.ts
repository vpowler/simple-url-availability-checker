import { IAlertMessage, IAlerterConfig } from "../../interfaces";

export class Alerter {
  baseAlerterConfig: IAlerterConfig;

  constructor(cfg: IAlerterConfig = {} as IAlerterConfig) {
    this.baseAlerterConfig = cfg;
  }

  init(): boolean {
    throw `The function cannot be used directly`;
  }
  send(msg: IAlertMessage): Promise<boolean> {
    throw `The function cannot be used directly`;
  }
}
