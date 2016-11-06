
import { Server } from "./server";

import * as Logger from "./logging/logger";

import { Config } from "./config";
const config = new Config().config;

const raven = require("raven");

if (config.env === "prod") {
    if (config.sentry.enabled === false) {
        Logger.warning("This instance is running in production, and Sentry is DISABLED");
    } else {
        Logger.info("Initializing Setry...");
        const client = new raven.Client(config.sentry.url);
        client.patchGlobal();
        Logger.info("Sentry initialized...");
    }
}

Logger.info("Opening socket...");

let server = new Server(3000);

server.listen();
