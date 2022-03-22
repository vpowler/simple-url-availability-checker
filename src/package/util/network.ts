import * as http from "http";
import * as https from "https";
import { config } from "../../config/config";

export function request(url: string): Promise<{ code: number; text: string }> {
  const module = url.startsWith("https") ? https : http;
  return new Promise((resolve) => {
    const req = module.request(url, { timeout: config.urlTimeout, method: "GET" }, (res) => {
      res.on("data", () => void 0);
      res.on("end", () =>
        resolve({ code: res.statusCode, text: res.statusMessage })
      );
    });
    req.on("error", (err) => resolve({ code: 0, text: err.message }));
    req.end();
  });
}
