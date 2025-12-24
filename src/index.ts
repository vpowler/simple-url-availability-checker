import { config } from "./config";
import { Checker } from "./lib/checker";
import { logger } from "./lib/logger";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms * 1000));

logger.info("-----------------");
logger.info("URL availability checker.");
logger.info(`Config: ${JSON.stringify(config)}`);
logger.info("Starting.");
logger.info("-----------------");

const urls = config.urlsLine.split(" ").filter(u => u.length > 0);
const checkers = urls.map(url => new Checker(url));

(async () => {
  while (true) {
    await Promise.all(checkers.map(c => c.check()));
    await sleep(config.sleepBetweenChecks);
  }
})();
