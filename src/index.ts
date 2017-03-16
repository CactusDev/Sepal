
import Config from "./configs/config";

import { Rethink } from "./rethink";
import { SepalSocket } from "./socket";

async function createSocket(rethink: Rethink) {
    const socket: SepalSocket = new SepalSocket(Config, rethink);
    await socket.create();
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
