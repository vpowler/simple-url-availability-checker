import * as http from "http";
import * as https from "https";
import { INetworkResponse } from "../types";

export function request(url: string, timeout: number = 5000): Promise<INetworkResponse> {
    const module = url.startsWith("https") ? https : http;

    return new Promise((resolve) => {
        const req = module.request(url, { timeout, method: "GET" }, (res) => {
            // Consume data to free memory
            res.on("data", () => void 0);
            res.on("end", () =>
                resolve({ code: res.statusCode || 0, text: res.statusMessage || "" })
            );
        });

        req.on("error", (err) => resolve({ code: 0, text: err.message }));
        req.on("timeout", () => {
            req.destroy();
            resolve({ code: 0, text: "Timeout" });
        });

        req.end();
    });
}
