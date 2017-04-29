
import "reflect-metadata";

import { Rethink } from "./rethink";
import { SepalSocket } from "./socket";
import { RepeatHandler } from "./repeat";
import { Logger } from "./logger";

import config from "./configs/config";

async function initLogger() {
    await Logger.createSentry(config.sentry);
}

async function createRethink() {
    const rethink: Rethink = new Rethink(config);
    await rethink.connect();
    return rethink;
}

async function startRepeats(rethink: Rethink, socket: SepalSocket) {
    const repeat: RepeatHandler = new RepeatHandler(socket, rethink);
    await repeat.startRepeats();
}

async function createSocket(rethink: Rethink) {
    const socket: SepalSocket = new SepalSocket(config, rethink);
    await socket.create();
    return socket;
}

async function init() {
    try {
        await initLogger();

        const rethink = await createRethink();
        const socket: SepalSocket = await createSocket(rethink);

        await startRepeats(rethink, socket);
    } catch (e) {
        console.error(e);
    }
}

init();
