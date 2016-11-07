import { Server } from "./server";
import { Redis } from "./redis";

import { Active } from "./active";

import { Config } from "./config";
import * as Logger from "./logging/logger";

// I don't even with this.
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

// Cretae a "Pub" connection to the Redis Server.
const RedisPub = new Redis();
const active = new Active(RedisPub, 5);

// Note: You should probs do the Database connection here also. But for now your way works. Unless I get bored and do it for you.

// Connect to the Redis server.
RedisPub.connect()
    .then(() => {
        Logger.info("Connected to the Redis server.");
        // Create the server.
        let server = new Server(RedisPub, 3000);
        // Start listening to connections.
        server.listen();

        setTimeout(() => active.checkActive(), 1000);
    }).then(() => {
        active.addUser("testing-stuff-things", "innectic");
    });
