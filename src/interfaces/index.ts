export interface IAlerterConfig {
  verbose: boolean;
}

export interface IAlertMessage {
  url: string;
  response: INetworkResponse;
}

export interface INetworkResponse {
  code: number;
  text: string;
}
