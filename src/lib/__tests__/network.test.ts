import { request } from "../network";
import * as https from "https";
import { EventEmitter } from "events";

jest.mock("https");

describe("Network Request", () => {
    it("should return code 200 and text OK on success", async () => {
        const mockRequest = new EventEmitter() as any;
        mockRequest.end = jest.fn();

        const mockResponse = new EventEmitter() as any;
        mockResponse.statusCode = 200;
        mockResponse.statusMessage = "OK";

        (https.request as jest.Mock).mockImplementation((url, options, cb) => {
            cb(mockResponse);
            // Simulate end of data
            mockResponse.emit("end");
            return mockRequest;
        });

        const result = await request("https://example.com");
        expect(result).toEqual({ code: 200, text: "OK" });
    });

    it("should return code 0 and error message on network error", async () => {
        const mockRequest = new EventEmitter() as any;
        mockRequest.end = jest.fn();

        (https.request as jest.Mock).mockImplementation((url, options, cb) => {
            return mockRequest;
        });

        const promise = request("https://example.com");
        mockRequest.emit("error", new Error("Network Error"));

        const result = await promise;
        expect(result).toEqual({ code: 0, text: "Network Error" });
    });
});
