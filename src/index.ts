
import { Server } from "./server";

import { Config } from "./config";
const config = new Config().config;

import { Active } from "./active/active";

const raven = require("raven");

let active = new Active();
active.watch();

if (config.env === "prod") {
    const client = new raven.Client();
    client.patchGlobal();
}

let server = new Server(3000);

server.listen();
