import { config } from "./config/config";
import { sleep } from "./package/util/sleep";
import { Checker } from "./package/url/checker";

console.log(`

    -----------------

    URL availability checker.
    
    Config: ${JSON.stringify(config)}
    
    Starting.
    
    -----------------
`);

const urls = config.urlsLine.split(" ");
const checkers: Checker[] = [];

urls.map((url) => checkers.push(new Checker(url)));

(async () => {
  while (1) {
    for (const checker of checkers) {
      await checker.urlCheck();
    }
    await sleep(config.sleepBetweenChecks);
  }
})();
