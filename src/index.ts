
import Config from "./configs/config";

import { Rethink } from "./rethink";
import { SepalSocket } from "./socket";
import { RepeatHandler } from "./repeat";

async function createSocket(rethink: Rethink) {
    const socket: SepalSocket = new SepalSocket(Config, rethink);
    await socket.create();

    await startRepeat(socket, rethink);
}

async function startRepeat(socket: SepalSocket, rethink: Rethink) {
    const repeat: RepeatHandler = new RepeatHandler(socket, rethink);
    await repeat.startRepeats();
}

async function createRethink() {
    const rethink: Rethink = new Rethink(Config);
    try {
        await rethink.connect();
        await createSocket(rethink);
    } catch (e) {
        console.error(e); // TODO: make this work with the logger
    }
}

createRethink();
