
import { Server } from "./server";

import { Config } from "./config";
const config = new Config().config;

const raven = require("raven");

if (config.env === "prod") {
    const client = new raven.Client();
    client.patchGlobal();
}

let server = new Server(3000);

server.listen();
