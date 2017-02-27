
import { Server } from "./server";
import { Redis } from "./redis";

import { Logger } from "./logging";

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
const args = cmdLineArgs(options);
Logger.debugMode = args.debug;

// Check that the env is production and that the dsn has been set to enable Sentry support.
if (config.env === "prod") {
    if (config.sentry.dsn) {
        Logger.log("Initializing Setry...");
        const client = new raven.Client(config.sentry.dsn);
        client.patchGlobal();
        // Give the logger the same Raven instance.
        Logger.raven = client;
        Logger.log("Sentry initialized...");
    } else {
        Logger.log("UNABLE TO USE SENTRY! SEPAL RUNNING IN PROD MODE! THIS IS DANGEROUS");
    }
}

// Cretae a "Pub" connection to the Redis Server.
const RedisPub = new Redis();

// Connect to the Redis server.
RedisPub.connect(config)
    .then(() => {
        Logger.log("Connected to the Redis server.");
        // Create the server.
        let server = new Server(RedisPub, config);
        // Start listening to connections.
        server.listen();
    });
