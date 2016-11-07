import { Server } from "./server";
import { Redis } from "./redis";

import { Config } from "./config";
import * as Logger from "./logging/logger";

// I don't even with this.
const config = new Config().config;

const raven = require("raven");

if (config.env === "prod") {
    const client = new raven.Client();
    client.patchGlobal();
}

// Cretae a "Pub" connection to the Redis Server.
const RedisPub = new Redis();

// Note: You should probs do the Database connection here also. But for now your way works. Unless I get bored and do it for you.

// Connect to the Redis server.
RedisPub.connect()
    .then(() => {
        Logger.info("Connected to the Redis server.");
        // Create the server.
        let server = new Server(RedisPub, 3000);
        // Start listening to connections.
        server.listen();
    });
