import { Server } from "./server";
import { Redis } from "./redis";

import { Active } from "./active";

import {Logger } from "./logging";

const cmdLineArgs = require("command-line-args");
const raven = require("raven");

/**
 * This uses a config file which is created using the TypeScript compile.
 * 
 * See: "configs" dir for an example and create a new version with the name of the
 *      env the appliction is running under.
 */
const config: IConfig = require("./configs/development");

const options = [
    { name: "debug", alias: "d", type: Boolean }
];

// Set the debug mode if needed.
const parsed = cmdLineArgs(options);
Logger.debugMode = parsed.debug;

// Check that the env is production and that the dsn has been set to enable Sentry support.
if (config.env === "prod") {
    if (config.sentry.dsn) {
        Logger.log("Initializing Setry...");
        const client = new raven.Client(config.sentry.dsn);
        client.patchGlobal();
        // Give the logger the same Raven instance.
        Logger.raven = client;
        Logger.log("Sentry initialized...");
    }
}

// Cretae a "Pub" connection to the Redis Server.
const RedisPub = new Redis();
// const active = new Active(RedisPub, 5);

// TODO: Fix the active stuff.

// Connect to the Redis server.
/*RedisPub.connect(config)
    .then(() => {
        Logger.log("Connected to the Redis server.");
        // Create the server.
        let server = new Server(RedisPub, config);
        // Start listening to connections.
        server.listen();

        // setInterval(() => active.checkActive(), 50000);
    });*/

let server = new Server(null, config);
server.listen();
