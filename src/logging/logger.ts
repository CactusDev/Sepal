const colors = require("colors/safe");

import { Config } from "../config";
const config = new Config().config;

const raven = require("raven");

let client: any = null;

if (config.env === "prod" && config.sentry.enabled) {
    client = new raven.Client(config.sentry.url);
}


export function info(message: string) {
    console.log(colors.green("INFO: ") + colors.white(message));
}

export function warning(message: string) {
    console.log(colors.yellow("WARN: ") + colors.white(message));
}

export function error(message: string) {
    console.log(colors.red("ERROR: ") + colors.white(message));
    if (client != null) {
        client.captureException(message);
    }
}

export function debug(message: string) {
    console.log(colors.blue("DEBUG: ") + colors.white(message));
}
