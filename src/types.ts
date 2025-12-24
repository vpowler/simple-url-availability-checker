export interface IAlerterConfig {
  verbose: boolean;
}

export interface INetworkResponse {
  code: number;
  text: string;
}

export interface IAlertMessage {
  url: string;
  response: INetworkResponse;
}

export interface IAlerter {
  init(): boolean;
  send(msg: IAlertMessage): Promise<void>;
}
