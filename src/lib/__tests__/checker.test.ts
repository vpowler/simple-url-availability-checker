import { Checker } from "../checker";
import { request } from "../network";
import { alerterManager } from "../../alerters";

jest.mock("../network");
jest.mock("../../alerters");
jest.mock("../logger");

describe("Checker", () => {
    let checker: Checker;
    const url = "https://example.com";

    beforeEach(() => {
        checker = new Checker(url);
        jest.clearAllMocks();
    });

    it("should toggle alert when state changes from normal to error", async () => {
        // First check: Success (Normal state)
        (request as jest.Mock).mockResolvedValue({ code: 200, text: "OK" });
        await checker.check();

        // Second check: Failure
        (request as jest.Mock).mockResolvedValue({ code: 500, text: "Error" });
        await checker.check();

        // Should NOT alert yet because 'lastAlerted' was 0 and now - 0 > interval is true, BUT
        // the logic is: toggleAlert is called.
        // Wait... the logic says:
        // if (!isSuccess && currentState === "normal") -> toggleAlert()
        // inside toggleAlert: if (now - lastAlerted > interval) -> sendAll
        // currentState becomes "alerted"

        // Since lastAlerted is 0, the first alert SHOULD be sent.
        expect(alerterManager.sendAll).toHaveBeenCalledTimes(1);
    });

    it("should toggle alert when state changes from error to normal", async () => {
        // 1. Failure -> Transition to Alerted
        (request as jest.Mock).mockResolvedValue({ code: 500, text: "Error" });
        jest.spyOn(Date, "now").mockReturnValue(1000000); // Initial time
        await checker.check();
        expect(alerterManager.sendAll).toHaveBeenCalledTimes(1);

        // Advance time by more than config.alertInterval (300s)
        jest.spyOn(Date, "now").mockReturnValue(1000000 + 400 * 1000);

        // 2. Success -> Transition to Normal
        (request as jest.Mock).mockResolvedValue({ code: 200, text: "OK" });
        await checker.check();

        // Should alert again (Recovery)
        expect(alerterManager.sendAll).toHaveBeenCalledTimes(2);
    });
});
